import subprocess
import sys

required_libraries = [
    "pymongo",
    "scikit-learn",
    "numpy",
    "flask",
    "pandas"
]

def install_library(library):
    subprocess.check_call([sys.executable, "-m", "pip", "install", library])

for library in required_libraries:
    try:
        __import__(library)
    except ImportError:
        print(f"Cài đặt thư viện {library}...")
        install_library(library)

from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from bson import ObjectId
import pandas as pd
import string


'''------------------- gợi ý theo thuộc tính sản phẩm -------------------'''
# Tạo danh sách stop word từ file
with open('recommend-system/stop_word_vi.txt', 'r', encoding="utf-8") as f:
    stop_words = set(f.read().splitlines())
# function
def ensure_object_id(value):
    """Chuyển giá trị sang ObjectId nếu nó chưa phải là ObjectId."""
    return value if isinstance(value, ObjectId) else ObjectId(value)
def remove_punctuation(text):
    return text.translate(str.maketrans('', '', string.punctuation))
def find_product_index_by_id_variation(product_id, dataProducts):
    for index, product in enumerate(dataProducts):
        if ensure_object_id(product['idVariation']) == ensure_object_id(product_id):
            return index, product['id']
    return -1, -1  # Return -1 if the product is not found
def find_top_2_parents(category_id, categories, max_depth=10):
    parents = []
    current_id = ensure_object_id(category_id)
    # Tìm danh mục hiện tại và lặp tìm cha
    while current_id:

        # Tìm danh mục hiện tại
        current_category = next((cat for cat in categories if cat['_id'] == current_id), None)
        if current_category and current_category['idParent']:
            # Tìm danh mục cha
            parent_category = next((cat for cat in categories if cat['_id'] == current_category['idParent']), None)
            if parent_category:
                parents.append(parent_category)
                current_id = parent_category['_id']  # Chuyển sang tìm cha tiếp theo
            else:
                
                break
        else:
            if len(parents) == 0:
                parents.append(current_category)
            break
    if len(parents) == 1:
        parents.append({"name": ""})
        return parents
    parents.reverse()
    return parents
def pre_process_product(product):
    output = []

    #xử lý danh mục sản phẩm và hãng sản xuất
    parents = find_top_2_parents(product["idCategory"], dataCategories)
    category = parents[0]["name"].lower()
    brand = parents[1]["name"].lower()
    # Xử lý mô tả sản phẩm
    description = product["description"].lower()
    description = remove_punctuation(description)
    description = description.split()
    description = [word for word in description if word not in stop_words]
    description = " ".join(description)

    tempProduct = {
        "id": product["_id"],
        "name": product["name"].lower(),
        "description": description,
        "currentCategory": product["nameCategory"].lower(),
        "category": category,
        "brand": brand,
    }
    for variation in product["variations"]:
        tempVariation = tempProduct.copy()
        tempVariation["idVariation"] = variation["_id"]
        tempVariation["price"] = variation["price"]
        tempVariation["slug"] = variation["slug"]

        output.append(tempVariation)
    return output
def create_product_vector(dataProducts):
    dataProducts = list(map(pre_process_product, dataProducts))
    dataProducts = [item for sublist in dataProducts for item in sublist]
    names = [product['name'] for product in dataProducts]
    descriptions = [product['description'] for product in dataProducts]
    currentCategories = [product['currentCategory'] for product in dataProducts]
    slugs = [product['slug'] for product in dataProducts]
    categories = [product['category'] for product in dataProducts]
    brands = [product['brand'] for product in dataProducts]

    prices = [product['price'] for product in dataProducts]

    # Vector hóa bằng TF-IDF
    tfidf_name = TfidfVectorizer().fit_transform(names).toarray()
    tfidf_description = TfidfVectorizer().fit_transform(descriptions).toarray()
    tfidf_currentCategory = TfidfVectorizer().fit_transform(currentCategories).toarray()
    tfidf_slug = TfidfVectorizer().fit_transform(slugs).toarray()
    tfidf_category = TfidfVectorizer().fit_transform(categories).toarray()
    tfidf_brand = TfidfVectorizer().fit_transform(brands).toarray()

    # Tăng tỉ trọng
    tfidf_category *= 2
    tfidf_brand *= 2

    # Chuẩn hóa giá
    scaler = StandardScaler()
    price_scaled = scaler.fit_transform(np.array(prices).reshape(-1, 1))


    # Kết hợp tất cả các đặc trưng
    product_vectors = np.hstack([tfidf_name, tfidf_description, tfidf_currentCategory , tfidf_slug, tfidf_category, tfidf_brand ,price_scaled])
    return product_vectors, dataProducts
#test
def get_product_content_based(idVariation, product_vectors, dataProducts, top_n=10):
    current_product_id_variation = ensure_object_id(idVariation)
    current_product_index, current_product_id = find_product_index_by_id_variation(current_product_id_variation, dataProducts)
    print(current_product_index, current_product_id)
    current_product_vector = product_vectors[current_product_index].reshape(1, -1)
    # Tính độ tương đồng cosine
    similarities = cosine_similarity(current_product_vector, product_vectors).flatten()
    # Sắp xếp các sản phẩm theo độ tương đồng (loại bỏ sản phẩm hiện tại)
    similar_products_indices = np.argsort(similarities)[::-1]  # Sắp xếp giảm dần
    similar_products_indices = [i for i in similar_products_indices if dataProducts[i]['id'] != current_product_id]
    # Sử dụng dictionary để lưu trữ sản phẩm có similarity cao nhất cho mỗi id
    unique_products = {}
    for index in similar_products_indices:
        product_id = dataProducts[index]['id']
        if product_id not in unique_products or similarities[index] > unique_products[product_id]['similarity']:
            unique_products[product_id] = {
                'index': index,
                'similarity': similarities[index]
            }
    # Lấy 10 phần tử đầu tiên
    top_10_similar_products = sorted(unique_products.values(), key=lambda x: x['similarity'], reverse=True)[:top_n]
    # Lấy thông tin sản phẩm
    top_10_similar_products = [
        # {
        #     'id': dataProducts[i]['id'],
        #     'name': dataProducts[i]['name'],
        #     'similarity': similarity
        # }
        str(dataProducts[i]['idVariation'])
        for i, similarity in [(item['index'], item['similarity']) for item in top_10_similar_products]
    ]
    return top_10_similar_products

'''------------------- gợi ý theo lịch sử mua hàng -------------------'''
def get_product_id_by_variation_id(dataProducts, idVariation):
    # Duyệt qua danh sách sản phẩm
    for product in dataProducts:
        # Kiểm tra từng variation trong sản phẩm
        for variation in product.get("variations", []):
            if variation["_id"] == ObjectId(idVariation):
                return str(product["_id"])  # Trả về _id của sản phẩm
    return None  # Không tìm thấy

def get_data_order_train(dataOrders, dataProducts):
    resultDataTrain = []
    for order in dataOrders:
        # Trích lọc idUser và cộng dồn idVariation
        id_user = str(order["idUser"])  # Chuyển ObjectId sang chuỗi
        details = order["details"]

        # Sử dụng từ điển để cộng dồn số lượng
        aggregated_data = {}
        for item in details:
            id_product = get_product_id_by_variation_id(dataProducts, str(item["idVariation"]))  # Chuyển ObjectId sang chuỗi
            quantity = item["quantity"]
            if id_product in aggregated_data:
                aggregated_data[id_product]["quantity"] += quantity  # Cộng dồn
            else:
                aggregated_data[id_product] = {
                    "idUser": id_user,
                    "idProduct": id_product,
                    "quantity": quantity
                }

        # Chuyển dữ liệu thành danh sách
        result = list(aggregated_data.values())
        resultDataTrain.extend(result)
    return resultDataTrain

def get_product_collaborative_user(product_id, product_ids, similarity_matrix, top_n=5):
    try:
        product_index = product_ids.get_loc(product_id)
    except KeyError:
        return []

    # Truy xuất độ tương đồng của sản phẩm với tất cả sản phẩm khác
    similarities = similarity_matrix[product_index]

    # Sắp xếp các sản phẩm theo độ tương đồng (giảm dần)
    similar_indices = np.argsort(similarities)[::-1]  # Sắp xếp giảm dần
    similar_products = [
        (product_ids[i], similarities[i]) for i in similar_indices if product_ids[i] != product_id
    ]

    # Lấy top N sản phẩm tương đồng nhất có similarity > 0.5
    similar_products = [product_id for product_id, similarity in similar_products if similarity > 0.01]
    return similar_products[:top_n]
    
    # return similar_products[:top_n]

'''------------------- kết nối database -------------------'''

client = MongoClient("mongodb+srv://nguyenphatssj0612:Be51yyb3YPQ10ZkT@cluster0.efuajlb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")  # Thay URL nếu bạn sử dụng Atlas hoặc server khác
db = client["test"]  # Chọn database
productsModel = db["products"]  # Chọn collection
categoriesModel = db["categories"]
ordersModel = db["orders"]

'''--------------------- lấy dữ liệu --------------------'''
# data train theo thuộc tính sản phẩm
pipeline = [
    {
        "$lookup": {
            "from": "categories",       # Collection cần nối (cities)
            "localField": "idCategory", # Trường trong users để nối (city_id)
            "foreignField": "_id",   # Trường trong cities để nối (_id)
            "as": "category"        # Tên mảng kết quả
        }
    },
    {
        "$unwind": "$category"     
    },
    {
        "$project": {               # Chọn các trường cần lấy
            "_id": 1,
            "name": 1,
            "description": 1,
            "variations": 1,
            "discount": 1,
            "nameCategory": "$category.name",
            "idCategory": "$category._id",
        }
    }
]
dataProductForContentBased = list(productsModel.aggregate(pipeline))
dataCategories = list(categoriesModel.find()) 

# data train theo lịch sử mua hàng
dataOrders = list(ordersModel.find())
dataProductForCollaborativeUser = list(productsModel.find())


'''------------------- xử lý dữ liệu -------------------'''
# lọc dữ liệu theo thuộc tính sản phẩm
productsVector, dataProductForContentBased = create_product_vector(dataProductForContentBased)
# lọc dữ liệu theo lịch sử mua hàng
dataOrders = get_data_order_train(dataOrders, dataProductForCollaborativeUser)

dataTrain_df = pd.DataFrame(dataOrders) 
user_item_matrix = dataTrain_df.pivot_table(index='idUser', columns='idProduct', values='quantity', fill_value=0)
collaborative_similarity = cosine_similarity(user_item_matrix.T)
product_ids_collaborative_user = user_item_matrix.columns

'''------------------- dựng sever -------------------'''
from flask import Flask, jsonify, request

# Tạo một đối tượng Flask
app = Flask(__name__)

# Định nghĩa một route cơ bản
@app.route('/')
def home():
    print("Hello, World!")
    return "Hello, World!"
@app.route('/api/get_product_content_based', methods=['GET'])
def api_get_product_content_based():
    # Lấy dữ liệu từ query URL
    id_variation = request.args.get('id_variation')
    result = get_product_content_based(id_variation, productsVector, dataProductForContentBased)
    return jsonify({
        'variation_ids': result
    })
@app.route('/api/get_product_collaborative_user', methods=['GET'])
def api_get_product_collaborative_user():
    # Lấy dữ liệu từ query URL
    product_id = request.args.get('product_id')
    result = get_product_collaborative_user(product_id, product_ids_collaborative_user, collaborative_similarity)
    return jsonify({
        'product_ids': result
    })
# Chạy ứng dụng
if __name__ == "__main__":
    app.run(debug=True,port=5000)