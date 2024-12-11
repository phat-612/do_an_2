from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from bson import ObjectId
import pandas as pd
import time

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

def recommend_products(product_id, product_ids, similarity_matrix, top_n=5):
    try:
        product_index = product_ids.get_loc(product_id)
    except KeyError:
        return f"Product ID '{product_id}' không tồn tại trong dữ liệu."

    # Truy xuất độ tương đồng của sản phẩm với tất cả sản phẩm khác
    similarities = similarity_matrix[product_index]

    # Sắp xếp các sản phẩm theo độ tương đồng (giảm dần)
    similar_indices = np.argsort(similarities)[::-1]  # Sắp xếp giảm dần
    similar_products = [
        (product_ids[i], similarities[i]) for i in similar_indices if product_ids[i] != product_id
    ]

    # Lấy top N sản phẩm tương đồng nhất
    return similar_products[:top_n]

# Kết nối đến MongoDB
client = MongoClient("mongodb+srv://nguyenphatssj0612:Be51yyb3YPQ10ZkT@cluster0.efuajlb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")  # Thay URL nếu bạn sử dụng Atlas hoặc server khác
db = client["test"]  # Chọn database
productsModel = db["products"]  # Chọn collection
categoriesModel = db["categories"]
ordersModel = db["orders"]


dataOrders = list(ordersModel.find())
dataProducts = list(productsModel.find())

dataOrders = get_data_order_train(dataOrders, dataProducts)

dataTrain_df = pd.DataFrame(dataOrders)  # Chuyển sang DataFrame

# Tạo ma trận user-item
user_item_matrix = dataTrain_df.pivot_table(index='idUser', columns='idProduct', values='quantity', fill_value=0)

# Tính toán ma trận tương đồng dựa trên hành vi mua hàng
collaborative_similarity = cosine_similarity(user_item_matrix.T)

product_ids = user_item_matrix.columns

product_id = '665e036fc2d0a3be92778afb'
similar_products = recommend_products(product_id, product_ids, collaborative_similarity)
print(similar_products)
