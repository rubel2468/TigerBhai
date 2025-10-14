import { AiOutlineDashboard } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { IoMdStarOutline } from "react-icons/io";
import { MdOutlinePermMedia } from "react-icons/md";
import { RiCoupon2Line } from "react-icons/ri";
import { MdOutlineSlideshow } from "react-icons/md";
import { MdStorefront } from "react-icons/md";
import { MessageCircle } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { ADMIN_VENDORS, ADMIN_META_CATALOG_SHOW, ADMIN_CATEGORY_ADD, ADMIN_CATEGORY_SHOW, ADMIN_COUPON_ADD, ADMIN_COUPON_SHOW, ADMIN_CUSTOMERS_SHOW, ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW, ADMIN_ORDER_SHOW, ADMIN_PRODUCT_ADD, ADMIN_PRODUCT_SHOW, ADMIN_PRODUCT_VARIANT_ADD, ADMIN_PRODUCT_VARIANT_SHOW, ADMIN_REVIEW_SHOW } from "@/routes/AdminPanelRoute";


export const adminAppSidebarMenu = [
    {
        title: "Dashboard",
        url: ADMIN_DASHBOARD,
        icon: AiOutlineDashboard
    },
    {
        title: "Category",
        url: "#",
        icon: BiCategory,
        submenu: [
            {
                title: "Add Category",
                url: ADMIN_CATEGORY_ADD
            },
            {
                title: "All Category",
                url: ADMIN_CATEGORY_SHOW
            }
        ]
    },
    {
        title: "Products",
        url: "#",
        icon: IoShirtOutline,
        submenu: [
            {
                title: "Add Product",
                url: ADMIN_PRODUCT_ADD
            },
            {
                title: "Add Variant",
                url: ADMIN_PRODUCT_VARIANT_ADD
            },
            {
                title: "All Products",
                url: ADMIN_PRODUCT_SHOW
            },
            {
                title: "Product Variants",
                url: ADMIN_PRODUCT_VARIANT_SHOW
            },
        ]
    },
    {
        title: "Meta Catalog",
        url: ADMIN_META_CATALOG_SHOW,
        icon: FaFacebook,
    },
    {
        title: "Coupons",
        url: "#",
        icon: RiCoupon2Line,
        submenu: [
            {
                title: "Add Coupon",
                url: ADMIN_COUPON_ADD
            },
            {
                title: "All Coupons",
                url: ADMIN_COUPON_SHOW
            },

        ]
    },
    {
        title: "Orders",
        url: ADMIN_ORDER_SHOW,
        icon: MdOutlineShoppingBag,

    },
    {
        title: "Customers",
        url: ADMIN_CUSTOMERS_SHOW,
        icon: LuUserRound,
    },
    {
        title: "Rating & Review",
        url: ADMIN_REVIEW_SHOW,
        icon: IoMdStarOutline,
    },
    {
        title: "Media",
        url: ADMIN_MEDIA_SHOW,
        icon: MdOutlinePermMedia,
    },
    {
        title: "Carousel",
        url: "/admin/carousel",
        icon: MdOutlineSlideshow,
    },
    {
        title: "Chats",
        url: "/admin/chats",
        icon: MessageCircle,
    },
    {
        title: "Vendors",
        url: ADMIN_VENDORS || "/admin/vendors",
        icon: MdStorefront,
    },
]