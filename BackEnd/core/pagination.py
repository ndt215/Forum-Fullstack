"""
Phân trang dùng chung cho toàn bộ REST API.

Mặc định 10 bản ghi/trang, nhưng FrontEnd có thể yêu cầu nhiều hơn bằng
tham số ?page_size=100 (tối đa 100) — tiện cho các danh sách nhỏ như
bình luận, thẻ món ăn, quán đã lưu...
"""

from rest_framework.pagination import PageNumberPagination


class TuyChinhPhanTrang(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100
