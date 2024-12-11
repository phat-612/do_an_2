from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
import string
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from bson import ObjectId


# Tạo danh sách stop word từ file
with open('stop_word_vi.txt', 'r', encoding="utf-8") as f:
    stop_words = set(f.read().splitlines())
# function
def ensure_object_id(value):
    """Chuyển giá trị sang ObjectId nếu nó chưa phải là ObjectId."""
    return value if isinstance(value, ObjectId) else ObjectId(value)
def remove_punctuation(text):
    return text.translate(str.maketrans('', '', string.punctuation))
def find_product_index_by_id(product_id, dataProducts):
    for index, product in enumerate(dataProducts):
        if ensure_object_id(product['id']) == ensure_object_id(product_id):
            return index
    return -1  # Return -1 if the product is not found
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


# Kết nối đến MongoDB
client = MongoClient("mongodb+srv://nguyenphatssj0612:Be51yyb3YPQ10ZkT@cluster0.efuajlb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")  # Thay URL nếu bạn sử dụng Atlas hoặc server khác
db = client["test"]  # Chọn database
productsModel = db["products"]  # Chọn collection
categoriesModel = db["categories"]
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
dataProducts = list(productsModel.aggregate(pipeline))
dataCategories = list(categoriesModel.find()) 

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

    # Tăng tỉ trọng cho danh mục
    category_weight = 2.0
    tfidf_category *= category_weight

    # Chuẩn hóa giá
    scaler = StandardScaler()
    price_scaled = scaler.fit_transform(np.array(prices).reshape(-1, 1))


    # Kết hợp tất cả các đặc trưng
    product_vectors = np.hstack([tfidf_name, tfidf_description, tfidf_currentCategory , tfidf_slug, tfidf_category, tfidf_brand ,price_scaled])
    return product_vectors, dataProducts
#test
def get_product(id, product_vectors, dataProducts):
    current_product_id = ensure_object_id(id)
    
    current_product_index = find_product_index_by_id(id, dataProducts)
    current_product_vector = product_vectors[current_product_index].reshape(1, -1)

    # Tính độ tương đồng cosine
    similarities = cosine_similarity(current_product_vector, product_vectors).flatten()
    # Sắp xếp các sản phẩm theo độ tương đồng (loại bỏ sản phẩm hiện tại)
    similar_products_indices = np.argsort(similarities)[::-1]  # Sắp xếp giảm dần


    # Lọc các sản phẩm có cùng id với sản phẩm hiện, tại
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
    top_10_similar_products = sorted(unique_products.values(), key=lambda x: x['similarity'], reverse=True)[:12]

    # In kết quả gợi ý
    print(f"Gợi ý sản phẩm tương tự: {dataProducts[current_product_index]['name']}")
    for item in top_10_similar_products:
        index = item['index']
        print(f"ID: {dataProducts[index]['id']}, Name: {dataProducts[index]['name']}, Slug: {dataProducts[index]['slug']}, Danh mục: {dataProducts[index]['category']}, Similarity: {item['similarity']:.2f}")


productsVector, dataProducts = create_product_vector(dataProducts)
get_product("665a791d6b3083c166cd77b6", productsVector, dataProducts)
