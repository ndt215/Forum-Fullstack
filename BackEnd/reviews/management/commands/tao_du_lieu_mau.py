"""
Lệnh tạo dữ liệu mẫu cho Măm Măm Food Review.

Chạy:
    cd BackEnd
    python manage.py tao_du_lieu_mau

Lệnh này an toàn để chạy nhiều lần: mỗi bản ghi được get_or_create theo
khóa nghiệp vụ, nên không tạo dữ liệu trùng lặp.

Tài khoản demo sau khi chạy:
    - admin    / admin123      (quản trị viên)
    - ngoctran / MamMam123!    (thành viên)
    - minhanh  / MamMam123!
    - hainam   / MamMam123!
    - maichi   / MamMam123!
"""

from datetime import time, timedelta
from pathlib import Path
import shutil

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from reviews.models import (
    BaiReview,
    BaoCao,
    BinhLuan,
    ChamDiem,
    HinhAnh,
    LuotThich,
    NguoiDung,
    NhaHang,
    QuanYeuThich,
    TheMonAn,
    TheoDoi,
)

# Thư mục ảnh mẫu do FrontEnd cung cấp, được sao chép sang media/ của BackEnd.
THU_MUC_ANH_NGUON = Path(settings.BASE_DIR).parent / "FrontEnd" / "src" / "assets" / "img"

MAT_KHAU_DEMO = "MamMam123!"

NGUOI_DUNG_MAU = [
    {
        "username": "admin",
        "password": "admin123",
        "ho_ten": "Quản trị viên Măm Măm",
        "email": "admin@mammam.vn",
        "vai_tro": "quan_tri_vien",
        "la_quan_tri": True,
        "tieu_su": "Người giữ cho cộng đồng Măm Măm luôn sạch và vui.",
        "avatar": None,
    },
    {
        "username": "ngoctran",
        "password": MAT_KHAU_DEMO,
        "ho_ten": "Ngọc Trân",
        "email": "ngoctran@mammam.vn",
        "vai_tro": "thanh_vien",
        "tieu_su": "Mỗi bữa ăn là một câu chuyện. Mình viết để nhớ, và để rủ bạn cùng đi ăn.",
        "avatar": "avatar-ngoc-tran.jpg",
    },
    {
        "username": "minhanh",
        "password": MAT_KHAU_DEMO,
        "ho_ten": "Minh Anh",
        "email": "minhanh@mammam.vn",
        "vai_tro": "thanh_vien",
        "tieu_su": "Đi tìm những bữa ăn khiến người ta nhớ lâu hơn cả món ăn.",
        "avatar": "avatar-minh-anh.jpg",
    },
    {
        "username": "hainam",
        "password": MAT_KHAU_DEMO,
        "ho_ten": "Hải Nam",
        "email": "hainam@mammam.vn",
        "vai_tro": "thanh_vien",
        "tieu_su": "Ăn từ Bắc vào Nam, viết lại những quán đáng quay lại.",
        "avatar": "avatar-hai-nam.jpg",
    },
    {
        "username": "maichi",
        "password": MAT_KHAU_DEMO,
        "ho_ten": "Mai Chi",
        "email": "maichi@mammam.vn",
        "vai_tro": "thanh_vien",
        "tieu_su": "Foodie Sài Gòn, mê bánh mì và những quán lâu năm.",
        "avatar": "avatar-mai-chi.jpg",
    },
]

NHA_HANG_MAU = [
    {
        "ten_quan": "Bún chả Hương Liên",
        "dia_chi": "35 Lê Văn Hưu, Phạm Đình Hổ",
        "quan_huyen": "Hai Bà Trưng",
        "thanh_pho": "Hà Nội",
        "so_dien_thoai": "024 3943 4106",
        "loai_am_thuc": "mon_viet",
        "gia_tu": 60000,
        "gia_den": 150000,
        "gio_mo_cua": time(10, 30),
        "gio_dong_cua": time(21, 0),
    },
    {
        "ten_quan": "Phở Thìn Lò Đúc",
        "dia_chi": "13 Lò Đúc, Phạm Đình Hổ",
        "quan_huyen": "Hai Bà Trưng",
        "thanh_pho": "Hà Nội",
        "so_dien_thoai": "024 3821 2709",
        "loai_am_thuc": "mon_nuoc",
        "gia_tu": 50000,
        "gia_den": 90000,
        "gio_mo_cua": time(6, 0),
        "gio_dong_cua": time(10, 0),
    },
    {
        "ten_quan": "Cơm Tấm Ba Ghiền",
        "dia_chi": "84 Đặng Văn Ngữ, Phường 10",
        "quan_huyen": "Phú Nhuận",
        "thanh_pho": "TP. Hồ Chí Minh",
        "so_dien_thoai": "028 3995 1831",
        "loai_am_thuc": "mon_viet",
        "gia_tu": 60000,
        "gia_den": 120000,
        "gio_mo_cua": time(7, 0),
        "gio_dong_cua": time(21, 0),
    },
    {
        "ten_quan": "Bánh Mì Huỳnh Hoa",
        "dia_chi": "26 Lê Thị Riêng, Bến Thành",
        "quan_huyen": "Quận 1",
        "thanh_pho": "TP. Hồ Chí Minh",
        "so_dien_thoai": "028 3822 0888",
        "loai_am_thuc": "do_an_nhanh",
        "gia_tu": 40000,
        "gia_den": 80000,
        "gio_mo_cua": time(14, 30),
        "gio_dong_cua": time(23, 0),
    },
    {
        "ten_quan": "Pizza 4P's Lê Thánh Tôn",
        "dia_chi": "8 Lê Thánh Tôn, Bến Nghé",
        "quan_huyen": "Quận 1",
        "thanh_pho": "TP. Hồ Chí Minh",
        "so_dien_thoai": "028 3822 2777",
        "loai_am_thuc": "khac",
        "gia_tu": 300000,
        "gia_den": 600000,
        "gio_mo_cua": time(11, 0),
        "gio_dong_cua": time(23, 0),
    },
    {
        "ten_quan": "Bé Mặn",
        "dia_chi": "84 Võ Nguyên Giáp, Mỹ An",
        "quan_huyen": "Ngũ Hành Sơn",
        "thanh_pho": "Đà Nẵng",
        "so_dien_thoai": "0236 3959 599",
        "loai_am_thuc": "hai_san",
        "gia_tu": 400000,
        "gia_den": 900000,
        "gio_mo_cua": time(10, 0),
        "gio_dong_cua": time(22, 0),
    },
]

THE_MON_AN_MAU = [
    "Bún chả",
    "Đồ nướng",
    "Đặc sản Hà Nội",
    "Quán lâu năm",
    "Phở bò",
    "Ăn sáng",
    "Món nước",
    "Cơm tấm",
    "Sườn nướng",
    "Bánh mì",
    "Ăn nhanh",
    "Quán nổi tiếng",
    "Pizza",
    "Burrata",
    "Hẹn hò",
    "Hải sản",
    "View biển",
    "Đà Nẵng",
]

BAI_REVIEW_MAU = [
    {
        "nha_hang": "Bún chả Hương Liên",
        "nguoi_dung": "minhanh",
        "tieu_de": "Bún chả Hương Liên: hương khói than hoa giữa lòng Hà Nội",
        "noi_dung": (
            "Mình ghé Bún chả Hương Liên vào một trưa thứ Bảy, khi cơn mưa Hà Nội vừa tạnh. "
            "Quán nằm trên phố Lê Văn Hưu, không quá hào nhoáng nhưng mùi than hoa từ bếp "
            "cuốn ra tận cửa khiến bước chân tự chậm lại.\n\n"
            "Suất bún chả đầy đặn: bún sợi mảnh, chả viên và chả miếng nướng xém cạnh, thơm "
            "mùi sả và mật ong. Nước chấm là điểm ăn tiền — chua thanh, ngọt dịu, đủ vị đu đủ "
            "và cà rốt giòn. Mình gọi thêm nem cua bể, vỏ giòn rụm, nhân cua thơm phức.\n\n"
            "Không gian quán khá đông, bàn kê sát nhau nên nếu đi nhóm đông bạn nên đến sớm. "
            "Nhân viên nhanh nhẹn, bún ra trong khoảng 10 phút. Mức giá 120.000đ cho hai người "
            "là hợp lý cho một quán nổi tiếng giữa trung tâm.\n\n"
            "Điểm trừ duy nhất là quán hơi ồn và nhà vệ sinh cần được chăm chút hơn. Nhưng với "
            "chất lượng chả nướng, mình vẫn sẽ quay lại — nhất là vào một buổi trưa se lạnh."
        ),
        "video_url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
        "the": ["Bún chả", "Đồ nướng", "Đặc sản Hà Nội", "Quán lâu năm"],
        "anh": ["bun-cha.jpg", "restaurant.jpg", "hero-food.jpg"],
        "cham_diem": [
            ("minhanh", 5.0, 4.5, 4.5, 4.0),
            ("ngoctran", 5.0, 4.0, 4.5, 4.5),
            ("hainam", 4.5, 4.0, 4.0, 4.5),
            ("maichi", 4.5, 4.5, 4.0, 4.0),
        ],
        "thich": ["ngoctran", "hainam", "maichi"],
        "binh_luan": [
            ("maichi", "Mình đi hôm cuối tuần, xếp hàng 20 phút nhưng bún chả lên nhanh. Nhất định phải gọi thêm nem cua bể!"),
            ("hainam", "Nước chấm ở đây hơi ngọt với khẩu vị miền Nam, nhưng chả nướng thơm thật. 8/10."),
            ("ngoctran", "Lưu ngay vào danh sách phải ăn khi ra Hà Nội. Cảm ơn bài review rất chi tiết!"),
        ],
    },
    {
        "nha_hang": "Phở Thìn Lò Đúc",
        "nguoi_dung": "ngoctran",
        "tieu_de": "Phở Thìn Lò Đúc: bát phở bò “đánh thức” cả sáng sớm",
        "noi_dung": (
            "Năm giờ sáng, phố Lò Đúc còn chưa tỉnh hẳn nhưng quán Phở Thìn đã đỏ lửa. "
            "Bát phở nóng hổi được bưng ra, khói bốc lên làm mờ cả kính cửa.\n\n"
            "Nước dùng trong veo, ngọt thanh từ xương bò hầm qua đêm. Thịt bò xào tái mềm, "
            "thơm mùi gừng và tỏi. Một chút giấm ớt, vài cọng hành lá là đủ cho một buổi sáng "
            "Hà Nội trọn vẹn.\n\n"
            "Quán đông nhưng nhân viên xoay vòng rất nhanh, tầm 5 phút là có bát. Giá 70.000đ "
            "cho một bát đầy đủ là hợp lý. Lưu ý quán chỉ mở buổi sáng, đến sau 9h là gần hết."
        ),
        "video_url": "",
        "the": ["Phở bò", "Ăn sáng", "Món nước", "Quán lâu năm"],
        "anh": ["pho.jpg", "restaurant.jpg"],
        "cham_diem": [
            ("ngoctran", 5.0, 3.5, 4.5, 4.5),
            ("minhanh", 4.5, 3.5, 4.0, 4.5),
            ("hainam", 4.5, 3.0, 4.0, 4.0),
        ],
        "thich": ["minhanh", "hainam"],
        "binh_luan": [
            ("minhanh", "Đúng chất phở Hà Nội, nước dùng trong mà vẫn đậm vị."),
            ("maichi", "Nghe mô tả là thấy thèm, cuối tuần này thử ngay."),
        ],
    },
    {
        "nha_hang": "Cơm Tấm Ba Ghiền",
        "nguoi_dung": "hainam",
        "tieu_de": "Cơm Tấm Ba Ghiền: miếng sườn nướng to gấp đôi bàn tay",
        "noi_dung": (
            "Đĩa cơm tấm ở Ba Ghiền nổi tiếng với miếng sườn nướng to gấp đôi bàn tay, "
            "ướp mềm và thấm vị. Cơm tấm dẻo thơm, chan mỡ hành béo ngậy, ăn kèm chả trứng "
            "và bì.\n\n"
            "Mình gọi thêm một chén canh khổ qua cho đỡ ngán. Quán đông khách nhưng bàn xoay "
            "nhanh, giá khoảng 90.000đ một đĩa đầy đủ.\n\n"
            "Điểm cần cải thiện là chỗ để xe hơi chật và quán khá nóng vào buổi trưa. Bù lại, "
            "chất lượng sườn nướng xứng đáng để quay lại."
        ),
        "video_url": "",
        "the": ["Cơm tấm", "Sườn nướng", "Món Việt", "Quán nổi tiếng"],
        "anh": ["com-tam.jpg"],
        "cham_diem": [
            ("hainam", 5.0, 3.5, 4.0, 4.5),
            ("minhanh", 4.5, 3.5, 4.0, 4.5),
            ("ngoctran", 4.5, 3.0, 3.5, 4.0),
        ],
        "thich": ["minhanh", "ngoctran", "maichi"],
        "binh_luan": [
            ("maichi", "Sườn ở đây đúng là to thật, ăn một đĩa no cả ngày."),
            ("ngoctran", "Lưu lại cho chuyến Sài Gòn tháng sau!"),
        ],
    },
    {
        "nha_hang": "Bánh Mì Huỳnh Hoa",
        "nguoi_dung": "maichi",
        "tieu_de": "Bánh mì Huỳnh Hoa: ổ bánh mì “nặng trịch” giữa Quận 1",
        "noi_dung": (
            "Ổ bánh mì ở Huỳnh Hoa nặng đến mức phải cầm bằng hai tay. Vỏ bánh giòn, pate béo, "
            "chả lụa, thịt nguội và dưa chua đầy ắp.\n\n"
            "Một ổ 65.000đ ăn là no đến chiều. Quán chỉ mở từ 14h30 nhưng khách xếp hàng từ "
            "trước đó, nên đi sớm hoặc đặt trước để đỡ chờ.\n\n"
            "Nếu bạn không ăn được nhiều, hãy gọi nửa ổ. Nhân viên đông và làm rất nhanh, "
            "không gian chỉ để mua mang đi."
        ),
        "video_url": "",
        "the": ["Bánh mì", "Ăn nhanh", "Quán nổi tiếng"],
        "anh": ["banh-mi.jpg"],
        "cham_diem": [
            ("maichi", 5.0, 3.0, 4.0, 4.5),
            ("hainam", 4.5, 3.0, 4.0, 4.0),
            ("minhanh", 4.5, 3.0, 4.5, 4.5),
        ],
        "thich": ["hainam", "minhanh"],
        "binh_luan": [
            ("hainam", "Ăn nửa ổ là đủ, còn lại mang về chiều ăn tiếp."),
            ("ngoctran", "Pate ở đây béo thật, nhưng hơi ngậy với mình."),
        ],
    },
    {
        "nha_hang": "Pizza 4P's Lê Thánh Tôn",
        "nguoi_dung": "hainam",
        "tieu_de": "Pizza 4P's Lê Thánh Tôn: đêm Sài Gòn có phô mai burrata",
        "noi_dung": (
            "Một buổi tối Sài Gòn mưa nhẹ, mình ghé Pizza 4P's Lê Thánh Tôn. Không gian ấm "
            "cúng, ánh đèn vàng và mùi bánh nướng thơm lừng.\n\n"
            "Đế pizza mỏng giòn, burrata béo mịn tan trong miệng. Món salad cà chua burrata là "
            "điểm nhấn, còn pizza phô mai 4 loại thì không thể bỏ qua.\n\n"
            "Giá hơi cao, khoảng 450.000đ cho hai người, nhưng xứng đáng cho một dịp đặc biệt. "
            "Nên đặt bàn trước vì quán rất đông vào cuối tuần."
        ),
        "video_url": "https://vimeo.com/76979871",
        "the": ["Pizza", "Burrata", "Hẹn hò"],
        "anh": ["pizza.jpg"],
        "cham_diem": [
            ("hainam", 5.0, 4.5, 4.5, 4.0),
            ("ngoctran", 5.0, 5.0, 4.5, 4.0),
            ("maichi", 4.5, 4.5, 4.5, 3.5),
        ],
        "thich": ["ngoctran", "maichi", "minhanh"],
        "binh_luan": [
            ("ngoctran", "Không gian đẹp, hợp đi hẹn hò. Burrata ở đây rất tươi."),
            ("maichi", "Giá hơi cao nhưng chất lượng ổn, đáng thử một lần."),
        ],
    },
    {
        "nha_hang": "Bé Mặn",
        "nguoi_dung": "ngoctran",
        "tieu_de": "Bé Mặn Đà Nẵng: bữa hải sản ven biển đáng từng đồng",
        "noi_dung": (
            "Bé Mặn nằm ngay ven biển Mỹ Khê, view hoàng hôn đẹp đến mức chỉ muốn ngồi mãi. "
            "Mình gọi tôm hùm nướng bơ tỏi, mực nhồi thịt và một nồi lẩu hải sản.\n\n"
            "Hải sản tươi, nêm nếm vừa phải, đặc biệt mực nhồi thịt thơm và mềm. Nhân viên "
            "nhiệt tình, còn chủ quán thì tư vấn rất kỹ.\n\n"
            "Giá khoảng 700.000đ cho hai người, cao hơn mặt bằng nhưng bù lại view và chất "
            "lượng. Nên đến trước 17h30 để có bàn sát biển."
        ),
        "video_url": "https://www.youtube.com/watch?v=LXb3EKWsInQ",
        "the": ["Hải sản", "View biển", "Đà Nẵng", "Hẹn hò"],
        "anh": ["seafood.jpg", "restaurant.jpg"],
        "cham_diem": [
            ("ngoctran", 5.0, 5.0, 4.5, 3.5),
            ("hainam", 4.5, 5.0, 4.5, 3.5),
            ("maichi", 4.5, 4.5, 4.0, 3.5),
        ],
        "thich": ["hainam", "minhanh", "maichi"],
        "binh_luan": [
            ("hainam", "View biển đẹp, hải sản tươi. Đáng đi một lần khi đến Đà Nẵng."),
            ("minhanh", "Hoàng hôn ở đây đúng là không chê vào đâu được."),
        ],
    },
]

QUAN_YEU_THICH_MAU = [
    ("ngoctran", "Bún chả Hương Liên"),
    ("ngoctran", "Pizza 4P's Lê Thánh Tôn"),
    ("minhanh", "Phở Thìn Lò Đúc"),
    ("hainam", "Bé Mặn"),
]

# Hai bài dưới đây minh hoạ luồng kiểm duyệt cho trang cá nhân:
# một bài đang chờ duyệt, một bài bị quản trị viên từ chối kèm lý do.
BAI_REVIEW_CHO_DUYET_MAU = [
    {
        "nha_hang": "Cơm Tấm Ba Ghiền",
        "nguoi_dung": "ngoctran",
        "tieu_de": "Cơm tấm Ba Ghiền: đĩa cơm đầy đặn cho buổi trưa Sài Gòn",
        "noi_dung": (
            "Mình ghé Ba Ghiền vào một trưa giữa tuần. Quán đông nhưng bàn xoay "
            "nhanh, khoảng 10 phút là có chỗ.\n\n"
            "Sườn nướng mềm, thấm vị, cơm tấm dẻo và mỡ hành thơm. Giá 95.000đ một "
            "đĩa đầy đủ, ăn no đến chiều.\n\n"
            "Điểm trừ là chỗ để xe hơi chật, đi xe máy sẽ tiện hơn."
        ),
        "video_url": "",
        "the": ["Cơm tấm", "Sườn nướng"],
        "anh": ["com-tam.jpg"],
        "cham_diem": [],
        "thich": [],
        "binh_luan": [],
        "trang_thai": "cho_duyet",
        "ngay_tao_cach_day": 2,
    },
    {
        "nha_hang": "Phở Thìn Lò Đúc",
        "nguoi_dung": "ngoctran",
        "tieu_de": "Thử lại Phở Thìn Lò Đúc lần hai: vẫn đáng xếp hàng",
        "noi_dung": (
            "Lần này mình quay lại Phở Thìn vào một sáng chủ nhật. Quán vẫn đông, "
            "nước dùng vẫn trong và ngọt thanh.\n\n"
            "Bát phở 70.000đ, thịt bò xào tái mềm. Điều mình thích nhất là cảm giác "
            "cả quán cùng ăn sáng thật nhanh rồi toả đi làm."
        ),
        "video_url": "",
        "the": ["Phở bò", "Ăn sáng"],
        "anh": ["pho.jpg"],
        "cham_diem": [],
        "thich": [],
        "binh_luan": [],
        "trang_thai": "bi_tu_choi",
        "ly_do_tu_choi": (
            "Nội dung trùng với bài đã đăng trước đó. Vui lòng bổ sung trải nghiệm "
            "mới hoặc thông tin khác biệt rồi gửi duyệt lại."
        ),
        "ngay_tao_cach_day": 5,
    },
]

BAO_CAO_MAU = [
    {
        "nguoi_dung": "maichi",
        "bai_review": "Bé Mặn Đà Nẵng: bữa hải sản ven biển đáng từng đồng",
        "loai": "noi_dung",
        "noi_dung": (
            "Bài viết có phần khen quán quá mức và nghi là quảng cáo. Nhờ quản trị "
            "viên kiểm tra lại giúp."
        ),
        "trang_thai": "moi",
    },
    {
        "nguoi_dung": "hainam",
        "bai_review": None,
        "loai": "loi_giao_dien",
        "noi_dung": (
            "Trên điện thoại, ảnh bìa ở trang chi tiết bài review bị cắt mất một "
            "phần. Nhờ kiểm tra lại giúp."
        ),
        "trang_thai": "dang_xu_ly",
    },
]

THEO_DOI_MAU = [
    ("ngoctran", "minhanh"),
    ("minhanh", "ngoctran"),
    ("hainam", "ngoctran"),
    ("maichi", "minhanh"),
]


class Command(BaseCommand):
    help = "Tạo dữ liệu mẫu cho Măm Măm Food Review (an toàn khi chạy nhiều lần)."

    def handle(self, *args, **options):
        media_root = Path(settings.MEDIA_ROOT)
        thu_muc_reviews = media_root / "reviews"
        thu_muc_avatars = media_root / "avatars"
        thu_muc_reviews.mkdir(parents=True, exist_ok=True)
        thu_muc_avatars.mkdir(parents=True, exist_ok=True)

        nguoi_dung = self._tao_nguoi_dung(thu_muc_avatars)
        nha_hang = self._tao_nha_hang()
        the_mon_an = self._tao_the_mon_an()
        bai_review = self._tao_bai_review(
            nguoi_dung,
            nha_hang,
            the_mon_an,
            thu_muc_reviews,
        )
        self._tao_tuong_tac(nguoi_dung, nha_hang, bai_review)
        self._tao_bao_cao(nguoi_dung, bai_review)

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=== ĐÃ TẠO DỮ LIỆU MẪU ==="))
        self.stdout.write(f"Người dùng : {NguoiDung.objects.count()}")
        self.stdout.write(f"Nhà hàng   : {NhaHang.objects.count()}")
        self.stdout.write(f"Thẻ món ăn : {TheMonAn.objects.count()}")
        self.stdout.write(f"Bài review : {BaiReview.objects.count()}")
        self.stdout.write(f"Chấm điểm  : {ChamDiem.objects.count()}")
        self.stdout.write(f"Hình ảnh   : {HinhAnh.objects.count()}")
        self.stdout.write(f"Bình luận  : {BinhLuan.objects.count()}")
        self.stdout.write(f"Lượt thích : {LuotThich.objects.count()}")
        self.stdout.write(f"Báo cáo    : {BaoCao.objects.count()}")
        self.stdout.write("")
        self.stdout.write("Tài khoản demo:")
        self.stdout.write("  admin    / admin123")
        self.stdout.write("  ngoctran / MamMam123!")
        self.stdout.write("  minhanh  / MamMam123!")
        self.stdout.write("  hainam   / MamMam123!")
        self.stdout.write("  maichi   / MamMam123!")

    # ------------------------------------------------------------------
    # Người dùng
    # ------------------------------------------------------------------
    def _tao_nguoi_dung(self, thu_muc_avatars):
        ket_qua = {}

        for du_lieu in NGUOI_DUNG_MAU:
            user, vua_tao = NguoiDung.objects.get_or_create(
                username=du_lieu["username"],
                defaults={
                    "ho_ten": du_lieu["ho_ten"],
                    "email": du_lieu["email"],
                    "vai_tro": du_lieu["vai_tro"],
                    "tieu_su": du_lieu.get("tieu_su", ""),
                },
            )

            if vua_tao:
                user.set_password(du_lieu["password"])
                user.is_staff = du_lieu.get("la_quan_tri", False)
                user.is_superuser = du_lieu.get("la_quan_tri", False)
                user.save()
                self.stdout.write(f"  + Người dùng: {user.username}")
            elif not user.check_password(du_lieu["password"]):
                # Đảm bảo tài khoản demo luôn đăng nhập được bằng mật khẩu công bố.
                user.set_password(du_lieu["password"])
                user.save(update_fields=["password"])

            ten_anh = du_lieu.get("avatar")
            if ten_anh and not user.anh_dai_dien:
                nguon = THU_MUC_ANH_NGUON / ten_anh
                if nguon.exists():
                    dich = thu_muc_avatars / ten_anh
                    if not dich.exists():
                        shutil.copy2(nguon, dich)
                    user.anh_dai_dien = f"avatars/{ten_anh}"
                    user.save(update_fields=["anh_dai_dien"])

            ket_qua[user.username] = user

        return ket_qua

    # ------------------------------------------------------------------
    # Nhà hàng
    # ------------------------------------------------------------------
    def _tao_nha_hang(self):
        ket_qua = {}

        for du_lieu in NHA_HANG_MAU:
            nha_hang, vua_tao = NhaHang.objects.get_or_create(
                ten_quan=du_lieu["ten_quan"],
                defaults={
                    key: value
                    for key, value in du_lieu.items()
                    if key != "ten_quan"
                },
            )
            if vua_tao:
                self.stdout.write(f"  + Nhà hàng: {nha_hang.ten_quan}")
            ket_qua[nha_hang.ten_quan] = nha_hang

        return ket_qua

    # ------------------------------------------------------------------
    # Thẻ món ăn
    # ------------------------------------------------------------------
    def _tao_the_mon_an(self):
        ket_qua = {}

        for ten_the in THE_MON_AN_MAU:
            the, vua_tao = TheMonAn.objects.get_or_create(ten_the=ten_the)
            if vua_tao:
                self.stdout.write(f"  + Thẻ: {the.ten_the}")
            ket_qua[ten_the] = the

        return ket_qua

    # ------------------------------------------------------------------
    # Bài review + ảnh + điểm
    # ------------------------------------------------------------------
    def _tao_bai_review(self, nguoi_dung, nha_hang, the_mon_an, thu_muc_reviews):
        ket_qua = {}

        for du_lieu in BAI_REVIEW_MAU + BAI_REVIEW_CHO_DUYET_MAU:
            tac_gia = nguoi_dung[du_lieu["nguoi_dung"]]
            quan = nha_hang[du_lieu["nha_hang"]]

            bai, vua_tao = BaiReview.objects.get_or_create(
                nguoi_dung=tac_gia,
                nha_hang=quan,
                tieu_de=du_lieu["tieu_de"],
                defaults={
                    "noi_dung": du_lieu["noi_dung"],
                    "video_url": du_lieu.get("video_url") or None,
                    "trang_thai": du_lieu.get("trang_thai", "da_dang"),
                    "ly_do_tu_choi": du_lieu.get("ly_do_tu_choi", ""),
                },
            )

            if vua_tao:
                bai.the_mon_an.set(
                    [the_mon_an[ten] for ten in du_lieu["the"] if ten in the_mon_an]
                )

                # Lùi ngày tạo để bài chờ duyệt / bị từ chối không chiếm đầu Feed.
                so_ngay = du_lieu.get("ngay_tao_cach_day")
                if so_ngay:
                    BaiReview.objects.filter(pk=bai.pk).update(
                        ngay_tao=timezone.now() - timedelta(days=so_ngay)
                    )
                    bai.refresh_from_db()

                self.stdout.write(f"  + Bài review: {bai.tieu_de}")

            # Ảnh (chỉ tạo nếu bài chưa có ảnh)
            if not bai.hinh_anh.exists():
                for thu_tu, ten_anh in enumerate(du_lieu["anh"]):
                    nguon = THU_MUC_ANH_NGUON / ten_anh
                    if not nguon.exists():
                        continue

                    dich = thu_muc_reviews / ten_anh
                    if not dich.exists():
                        shutil.copy2(nguon, dich)

                    HinhAnh.objects.create(
                        bai_review=bai,
                        nguoi_dung=tac_gia,
                        hinh_anh=f"reviews/{ten_anh}",
                        mo_ta=du_lieu["tieu_de"],
                        la_anh_bia=(thu_tu == 0),
                        thu_tu=thu_tu,
                    )

            # Điểm đánh giá
            for ten_nguoi, vi_giac, khong_gian, phuc_vu, gia_ca in du_lieu["cham_diem"]:
                nguoi_cham = nguoi_dung[ten_nguoi]
                ChamDiem.objects.get_or_create(
                    bai_review=bai,
                    nguoi_dung=nguoi_cham,
                    defaults={
                        "vi_giac": vi_giac,
                        "khong_gian": khong_gian,
                        "phuc_vu": phuc_vu,
                        "gia_ca": gia_ca,
                    },
                )

            ChamDiem.cap_nhat_diem_trung_binh(bai.pk)
            bai.refresh_from_db()
            ket_qua[bai.tieu_de] = bai

        return ket_qua

    # ------------------------------------------------------------------
    # Lượt thích, bình luận, quán yêu thích, theo dõi
    # ------------------------------------------------------------------
    def _tao_tuong_tac(self, nguoi_dung, nha_hang, bai_review):
        for du_lieu in BAI_REVIEW_MAU:
            bai = bai_review[du_lieu["tieu_de"]]

            for ten_nguoi in du_lieu["thich"]:
                LuotThich.objects.get_or_create(
                    nguoi_dung=nguoi_dung[ten_nguoi],
                    bai_review=bai,
                )

            for ten_nguoi, noi_dung in du_lieu["binh_luan"]:
                BinhLuan.objects.get_or_create(
                    bai_review=bai,
                    nguoi_dung=nguoi_dung[ten_nguoi],
                    noi_dung=noi_dung,
                )

            # Đồng bộ bộ đếm lượt thích với số bản ghi thật.
            so_luot = bai.danh_sach_luot_thich.count()
            BaiReview.objects.filter(pk=bai.pk).update(luot_thich=so_luot)

        for ten_nguoi, ten_quan in QUAN_YEU_THICH_MAU:
            QuanYeuThich.objects.get_or_create(
                nguoi_dung=nguoi_dung[ten_nguoi],
                nha_hang=nha_hang[ten_quan],
            )

        for nguoi_theo_doi, nguoi_duoc_theo_doi in THEO_DOI_MAU:
            TheoDoi.objects.get_or_create(
                nguoi_theo_doi=nguoi_dung[nguoi_theo_doi],
                nguoi_duoc_theo_doi=nguoi_dung[nguoi_duoc_theo_doi],
            )

    # ------------------------------------------------------------------
    # Báo cáo gửi quản trị viên
    # ------------------------------------------------------------------
    def _tao_bao_cao(self, nguoi_dung, bai_review):
        for du_lieu in BAO_CAO_MAU:
            tieu_de = du_lieu.get("bai_review")

            bao_cao, vua_tao = BaoCao.objects.get_or_create(
                nguoi_dung=nguoi_dung[du_lieu["nguoi_dung"]],
                bai_review=bai_review.get(tieu_de) if tieu_de else None,
                loai=du_lieu["loai"],
                noi_dung=du_lieu["noi_dung"],
                defaults={"trang_thai": du_lieu.get("trang_thai", "moi")},
            )

            if vua_tao:
                ten_nguoi = du_lieu["nguoi_dung"]
                nhan = tieu_de or "báo lỗi chung"
                self.stdout.write(f"  + Báo cáo: {ten_nguoi} → {nhan}")
