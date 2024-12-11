from flask import Flask, request, jsonify

# Tạo một đối tượng Flask
app = Flask(__name__)
app.run(debug=True, port=5000)
# Định nghĩa một route cơ bản
@app.route('/')
def home():
    return "Hello, World!"
@app.route('/api/get_products_recommend_content_base', methods=['GET'])
def get_products_recommend_content_base():
    
# Chạy ứng dụng
if __name__ == "__main__":
    app.run(debug=True)
