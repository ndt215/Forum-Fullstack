"""
ModelSerializer cho các bảng chính của app reviews.

Serializer có nhiệm vụ:
1. Chuyển Model (Python) -> JSON để trả về cho client.
2. Kiểm tra dữ liệu (validate) khi client gửi JSON lên để tạo/cập nhật.

Tài liệu: https://www.django-rest-framework.org/api-guide/serializers/
"""

from django.contrib.auth import authenticate
from django.db.models import Sum
from rest_framework import serializers

from .models import (
    BaiReview,
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


# ===========================================================================
# NGƯỜI DÙNG
# ===========================================================================
class NguoiDungSerializer(serializers.ModelSerializer):
    """Hiển thị thông tin người dùng, có hỗ trợ đặt mật khẩu khi tạo mới."""

    # Client gửi lên trường "mat_khau", hệ thống băm ra trường "password".
    mat_khau = serializers.CharField(
        write_only=True,
        required=False,
        min_length=6,
        help_text="Mật khẩu (tối thiểu 6 ký tự), không bao giờ được trả về.",
    )
    so_bai_review = serializers.SerializerMethodField()
    tong_luot_thich = serializers.SerializerMethodField()

    class Meta:
        model = NguoiDung
        fields = [
            "id",
            "username",
            "ho_ten",
            "email",
            "anh_dai_dien",
            "tieu_su",
            "vai_tro",
            "trang_thai",
            "mat_khau",
            "so_bai_review",
            "tong_luot_thich",
            "ngay_tao",
        ]
        read_only_fields = ["id", "ngay_tao", "vai_tro", "trang_thai"]

    def get_so_bai_review(self, obj):
        return obj.bai_review.count()

    def get_tong_luot_thich(self, obj):
        return obj.bai_review.aggregate(tong=Sum("luot_thich"))["tong"] or 0

    def create(self, validated_data):
        """Băm mật khẩu trước khi lưu vào CSDL (không lưu mật khẩu thô)."""
        mat_khau = validated_data.pop("mat_khau", None)
        nguoi_dung = NguoiDung(**validated_data)

        if mat_khau:
            nguoi_dung.set_password(mat_khau)
        else:
            # Không có mật khẩu -> tài khoản không thể đăng nhập bằng mật khẩu.
            nguoi_dung.set_unusable_password()

        nguoi_dung.save()
        return nguoi_dung

    def update(self, instance, validated_data):
        """Cập nhật thông tin, nếu có mật khẩu mới thì băm lại."""
        mat_khau = validated_data.pop("mat_khau", None)
        instance = super().update(instance, validated_data)

        if mat_khau:
            instance.set_password(mat_khau)
            instance.save()

        return instance


# ===========================================================================
# NHÀ HÀNG
# ===========================================================================
class NhaHangSerializer(serializers.ModelSerializer):
    khoang_gia = serializers.ReadOnlyField()
    so_bai_review = serializers.IntegerField(
        source="bai_review.count",
        read_only=True,
    )

    class Meta:
        model = NhaHang
        fields = [
            "id",
            "ten_quan",
            "slug",
            "dia_chi",
            "quan_huyen",
            "thanh_pho",
            "so_dien_thoai",
            "loai_am_thuc",
            "gia_tu",
            "gia_den",
            "khoang_gia",
            "gio_mo_cua",
            "gio_dong_cua",
            "so_bai_review",
            "ngay_tao",
            "ngay_cap_nhat",
        ]
        read_only_fields = ["id", "slug", "ngay_tao", "ngay_cap_nhat"]

    def validate(self, attrs):
        """Kiểm tra giá đến không được nhỏ hơn giá từ."""
        gia_tu = attrs.get("gia_tu", getattr(self.instance, "gia_tu", 0))
        gia_den = attrs.get("gia_den", getattr(self.instance, "gia_den", 0))

        if gia_den and gia_tu and gia_den < gia_tu:
            raise serializers.ValidationError(
                {"gia_den": "Giá đến phải lớn hơn hoặc bằng giá từ."}
            )
        return attrs


# ===========================================================================
# THẺ MÓN ĂN
# ===========================================================================
class TheMonAnSerializer(serializers.ModelSerializer):
    so_bai_review = serializers.IntegerField(
        source="bai_review.count",
        read_only=True,
    )

    class Meta:
        model = TheMonAn
        fields = ["id", "ten_the", "slug", "so_bai_review", "ngay_tao"]
        read_only_fields = ["id", "slug", "ngay_tao"]


# ===========================================================================
# CHẤM ĐIỂM
# ===========================================================================
class ChamDiemSerializer(serializers.ModelSerializer):
    # [MOI] Người chấm do server gán, client không được tự chọn
    nguoi_dung = serializers.PrimaryKeyRelatedField(read_only=True)
    ten_nguoi_dung = serializers.CharField(
        source="nguoi_dung.username",
        read_only=True,
    )
    diem_trung_binh = serializers.ReadOnlyField()

    class Meta:
        model = ChamDiem
        fields = [
            "id",
            "bai_review",
            "nguoi_dung",
            "ten_nguoi_dung",
            "vi_giac",
            "khong_gian",
            "phuc_vu",
            "gia_ca",
            "diem_trung_binh",
            "ngay_tao",
            "ngay_cap_nhat",
        ]
        read_only_fields = [
            "id",
            "nguoi_dung",
            "diem_trung_binh",
            "ngay_tao",
            "ngay_cap_nhat",
        ]


# ===========================================================================
# HÌNH ẢNH
# ===========================================================================
class HinhAnhSerializer(serializers.ModelSerializer):
    # [MOI] Người tải ảnh do server gán
    nguoi_dung = serializers.PrimaryKeyRelatedField(read_only=True)
    ten_nguoi_dung = serializers.CharField(
        source="nguoi_dung.username",
        read_only=True,
    )
    url = serializers.SerializerMethodField()

    def get_url(self, obj):
        """Trả về đường dẫn ảnh để FrontEnd hiển thị."""
        if not obj.hinh_anh:
            return None
        return obj.hinh_anh.url

    class Meta:
        model = HinhAnh
        fields = [
            "id",
            "bai_review",
            "nguoi_dung",
            "ten_nguoi_dung",
            "hinh_anh",
            "url",
            "mo_ta",
            "la_anh_bia",
            "thu_tu",
            "ngay_tao",
        ]
        read_only_fields = ["id", "nguoi_dung", "url", "ngay_tao"]


# ===========================================================================
# BÀI REVIEW
# ===========================================================================
class BaiReviewSerializer(serializers.ModelSerializer):
    # Thông tin đọc thêm để client không phải gọi thêm API
    ten_nguoi_dung = serializers.CharField(
        source="nguoi_dung.username",
        read_only=True,
    )
    avatar_nguoi_dung = serializers.SerializerMethodField()
    tieu_su_nguoi_dung = serializers.CharField(
        source="nguoi_dung.tieu_su",
        read_only=True,
    )
    ten_nha_hang = serializers.CharField(
        source="nha_hang.ten_quan",
        read_only=True,
    )
    dia_chi_quan = serializers.CharField(
        source="nha_hang.dia_chi",
        read_only=True,
    )
    so_dien_thoai_quan = serializers.CharField(
        source="nha_hang.so_dien_thoai",
        read_only=True,
    )
    loai_am_thuc = serializers.CharField(
        source="nha_hang.loai_am_thuc",
        read_only=True,
    )
    ten_loai_am_thuc = serializers.CharField(
        source="nha_hang.get_loai_am_thuc_display",
        read_only=True,
    )
    khoang_gia = serializers.ReadOnlyField(source="nha_hang.khoang_gia")
    khu_vuc = serializers.SerializerMethodField()
    gio_mo_cua = serializers.SerializerMethodField()
    gio_dong_cua = serializers.SerializerMethodField()
    trang_thai_hien_thi = serializers.CharField(
        source="get_trang_thai_display",
        read_only=True,
    )
    anh_bia = serializers.SerializerMethodField()
    so_binh_luan = serializers.SerializerMethodField()
    da_thich = serializers.SerializerMethodField()

    # [SUA] Một bài review có NHIỀU lượt chấm (trước đây là một)
    danh_sach_cham_diem = ChamDiemSerializer(many=True, read_only=True)
    hinh_anh = HinhAnhSerializer(many=True, read_only=True)
    danh_sach_the = TheMonAnSerializer(
        source="the_mon_an",
        many=True,
        read_only=True,
    )
    # Khi tạo/cập nhật, client gửi danh sách ID thẻ: "the_mon_an": [1, 2]
    the_mon_an = serializers.PrimaryKeyRelatedField(
        queryset=TheMonAn.objects.all(),
        many=True,
        required=False,
        write_only=True,
    )

    diem_cua_toi = serializers.SerializerMethodField()

    def get_diem_cua_toi(self, obj):
        """[MOI] Trả về lượt chấm của người đang gọi (nếu đã đăng nhập)."""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None

        cham_diem = obj.danh_sach_cham_diem.filter(
            nguoi_dung=request.user
        ).first()
        return ChamDiemSerializer(cham_diem).data if cham_diem else None

    def get_avatar_nguoi_dung(self, obj):
        anh = obj.nguoi_dung.anh_dai_dien
        return anh.url if anh else None

    def get_khu_vuc(self, obj):
        """Ví dụ: "Hai Bà Trưng, Hà Nội"."""
        quan = obj.nha_hang.quan_huyen
        thanh_pho = obj.nha_hang.thanh_pho
        return ", ".join(phan for phan in (quan, thanh_pho) if phan)

    def get_gio_mo_cua(self, obj):
        gio = obj.nha_hang.gio_mo_cua
        return gio.strftime("%H:%M") if gio else None

    def get_gio_dong_cua(self, obj):
        gio = obj.nha_hang.gio_dong_cua
        return gio.strftime("%H:%M") if gio else None

    def get_anh_bia(self, obj):
        """Ảnh bìa (hoặc ảnh đầu tiên) của bài review."""
        danh_sach = list(obj.hinh_anh.all())
        if not danh_sach:
            return None

        anh_bia = next((anh for anh in danh_sach if anh.la_anh_bia), danh_sach[0])
        return anh_bia.hinh_anh.url if anh_bia.hinh_anh else None

    def get_so_binh_luan(self, obj):
        return len(obj.binh_luan.all())

    def get_da_thich(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return any(
            luot.nguoi_dung_id == request.user.id
            for luot in obj.danh_sach_luot_thich.all()
        )

    class Meta:
        model = BaiReview
        fields = [
            "id",
            "nguoi_dung",
            "ten_nguoi_dung",
            "avatar_nguoi_dung",
            "tieu_su_nguoi_dung",
            "nha_hang",
            "ten_nha_hang",
            "dia_chi_quan",
            "so_dien_thoai_quan",
            "loai_am_thuc",
            "ten_loai_am_thuc",
            "khoang_gia",
            "khu_vuc",
            "gio_mo_cua",
            "gio_dong_cua",
            "tieu_de",
            "noi_dung",
            "video_url",
            "diem_trung_binh",
            "trang_thai",
            "trang_thai_hien_thi",
            "luot_thich",
            "da_thich",
            "so_binh_luan",
            "the_mon_an",
            "danh_sach_the",
            "danh_sach_cham_diem",
            "diem_cua_toi",
            "hinh_anh",
            "anh_bia",
            "ngay_tao",
            "ngay_cap_nhat",
        ]
        read_only_fields = [
            "id",
            # [SUA] Không cho client tự đổi chủ bài / tự duyệt bài
            "nguoi_dung",
            "trang_thai",
            "diem_trung_binh",
            "luot_thich",
            "ngay_tao",
            "ngay_cap_nhat",
        ]


# ===========================================================================
# BÌNH LUẬN
# ===========================================================================
class BinhLuanSerializer(serializers.ModelSerializer):
    ten_nguoi_dung = serializers.CharField(
        source="nguoi_dung.username",
        read_only=True,
    )
    avatar_nguoi_dung = serializers.SerializerMethodField()

    def get_avatar_nguoi_dung(self, obj):
        anh = obj.nguoi_dung.anh_dai_dien
        return anh.url if anh else None

    class Meta:
        model = BinhLuan
        fields = [
            "id",
            "bai_review",
            "nguoi_dung",
            "ten_nguoi_dung",
            "avatar_nguoi_dung",
            "noi_dung",
            "luot_thich",
            "ngay_tao",
        ]
        read_only_fields = [
            "id",
            "nguoi_dung",
            "avatar_nguoi_dung",
            "luot_thich",
            "ngay_tao",
        ]


# ===========================================================================
# CÁC BẢNG NỐI
# ===========================================================================
class LuotThichSerializer(serializers.ModelSerializer):
    class Meta:
        model = LuotThich
        fields = ["id", "nguoi_dung", "bai_review", "ngay_tao"]
        read_only_fields = ["id","nguoi_dung" , "ngay_tao"]


class QuanYeuThichSerializer(serializers.ModelSerializer):
    nha_hang_chi_tiet = serializers.SerializerMethodField()

    class Meta:
        model = QuanYeuThich
        fields = [
            "id",
            "nguoi_dung",
            "nha_hang",
            "nha_hang_chi_tiet",
            "ngay_tao",
        ]
        read_only_fields = ["id", "nguoi_dung", "nha_hang_chi_tiet", "ngay_tao"]

    def get_nha_hang_chi_tiet(self, obj):
        """Kèm thông tin quán + bài review mới nhất để hiển thị ở trang cá nhân."""
        quan = obj.nha_hang
        bai = (
            quan.bai_review.filter(trang_thai=BaiReview.TrangThai.DA_DANG)
            .select_related("nguoi_dung")
            .prefetch_related("hinh_anh", "the_mon_an")
            .order_by("-ngay_tao")
            .first()
        )

        du_lieu = {
            "id": quan.id,
            "ten_quan": quan.ten_quan,
            "dia_chi": quan.dia_chi,
            "quan_huyen": quan.quan_huyen,
            "thanh_pho": quan.thanh_pho,
            "khu_vuc": f"{quan.quan_huyen}, {quan.thanh_pho}".strip(", "),
            "loai_am_thuc": quan.loai_am_thuc,
            "ten_loai_am_thuc": quan.get_loai_am_thuc_display(),
            "khoang_gia": quan.khoang_gia,
            "bai_review_gan_nhat": None,
        }

        if bai:
            danh_sach_anh = list(bai.hinh_anh.all())
            anh_bia = next(
                (anh for anh in danh_sach_anh if anh.la_anh_bia),
                danh_sach_anh[0] if danh_sach_anh else None,
            )
            trich_doan = bai.noi_dung
            if len(trich_doan) > 170:
                trich_doan = f"{trich_doan[:170]}…"

            du_lieu["bai_review_gan_nhat"] = {
                "id": bai.id,
                "tieu_de": bai.tieu_de,
                "trich_doan": trich_doan,
                "anh_bia": anh_bia.hinh_anh.url
                if anh_bia and anh_bia.hinh_anh
                else None,
                "diem_trung_binh": bai.diem_trung_binh,
                "luot_thich": bai.luot_thich,
                "so_binh_luan": bai.binh_luan.count(),
                "ngay_tao": bai.ngay_tao,
                "ten_nguoi_dung": bai.nguoi_dung.username,
                "avatar_nguoi_dung": bai.nguoi_dung.anh_dai_dien.url
                if bai.nguoi_dung.anh_dai_dien
                else None,
                "tags": [the.ten_the for the in bai.the_mon_an.all()[:3]],
            }

        return du_lieu


class TheoDoiSerializer(serializers.ModelSerializer):
    class Meta:
        model = TheoDoi
        fields = [
            "id",
            "nguoi_theo_doi",
            "nguoi_duoc_theo_doi",
            "ngay_tao",
        ]
        read_only_fields = ["id","nguoi_theo_doi", "ngay_tao"]

    def validate(self, attrs):
        nguoi_theo_doi = self.context["request"].user
        nguoi_duoc = attrs.get("nguoi_duoc_theo_doi")

        if nguoi_duoc and nguoi_duoc.pk == nguoi_theo_doi.pk:
            raise serializers.ValidationError(
                "Bạn không thể tự theo dõi chính mình."
            )
        return attrs

#   -------
#   DANG KY
#   -------
class DangKySerializer(serializers.ModelSerializer):
    mat_khau = serializers.CharField(
        label="Mật khẩu",
        write_only=True,
        min_length=6,
        trim_whitespace=False,
        style={"input_type": "password"},
        help_text="Tối thiểu 6 ký tự.",
        error_messages={
            "min_length": "Mật khẩu phải có ít nhất 6 ký tự.",
        },
    )
    mat_khau_2 = serializers.CharField(
        label="Nhập lại mật khẩu",
        write_only=True,
        min_length=6,
        trim_whitespace=False,
        style={"input_type": "password"},
        help_text="Gõ lại mật khẩu để xác nhận.",
        error_messages={
            "min_length": "Mật khẩu nhập lại phải có ít nhất 6 ký tự.",
        },
    )

    class Meta:
        model = NguoiDung
        fields = ["username", "email", "ho_ten", "mat_khau", "mat_khau_2"]
        extra_kwargs = {
            "username": {"label": "Tên đăng nhập"},
            "email": {"label": "Email"},
            "ho_ten": {"label": "Họ và tên"},
        }
    def validate(self, attrs):
        mat_khau = attrs.get("mat_khau")
        mat_khau_2 = attrs.get("mat_khau_2")

        if mat_khau and mat_khau_2 and mat_khau != mat_khau_2:
            raise serializers.ValidationError(
                {"mat_khau_2": "Mật khẩu nhập lại không khớp."}
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("mat_khau_2")
        mat_khau = validated_data.pop("mat_khau")

        validated_data.setdefault("vai_tro", NguoiDung.VaiTro.THANH_VIEN)

        return NguoiDung.objects.create_user(
            password=mat_khau,
            **validated_data,
        )


#   ---------------------
#    CHUC NANG DANG NHAP
#   ---------------------
class DangNhapSerializer(serializers.Serializer): #Khong phai mot bang nen kthua Serializer
    """Nhận username/password và xác thực với CSDL."""

    username = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        user = authenticate(
            username=attrs.get("username"),
            password=attrs.get("password"),
        )

        if user is None:
            raise serializers.ValidationError(
                "Sai tên đăng nhập hoặc mật khẩu."
            )

        attrs["user"] = user
        return attrs