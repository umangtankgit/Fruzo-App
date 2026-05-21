import logo from "./logo.png";
import search_icon from "./search_icon.svg";
import remove_icon from "./remove_icon.svg";
import arrow_right_icon_colored from "./arrow_right_icon_colored.svg";
import star_icon from "./star_icon.svg";
import star_dull_icon from "./star_dull_icon.svg";
import cart_icon from "./cart_icon.svg";
import nav_cart_icon from "./nav_cart_icon.svg";
import add_icon from "./add_icon.svg";
import refresh_icon from "./refresh_icon.svg";
import product_list_icon from "./product_list_icon.svg";
import order_icon from "./order_icon.svg";
import upload_area from "./upload_area.png";
import profile_icon from "./profile_icon.png";
import menu_icon from "./menu_icon.svg";
import delivery_truck_icon from "./delivery_truck_icon.svg";
import leaf_icon from "./leaf_icon.svg";
import coin_icon from "./coin_icon.svg";
import box_icon from "./box_icon.svg";
import trust_icon from "./trust_icon.svg";
import black_arrow_icon from "./black_arrow_icon.svg";
import white_arrow_icon from "./white_arrow_icon.svg";
import main_banner_bg from "./main_banner_bg.png";
import main_banner_bg_sm from "./main_banner_bg_sm.png";
import bottom_banner_image from "./bottom_banner_image.png";
import bottom_banner_image_sm from "./bottom_banner_image_sm.png";
import add_address_iamge from "./add_address_image.svg";

// Local Transparent Fruit Images
import mango_image_1 from "./mango_image_1.png";
import banana_image_1 from "./banana_image_1.png";
import orange_image from "./orange_image.png";
import grapes_image_1 from "./grapes_image_1.png";
import apple_image from "./apple_image.png";
import melon_image from "./melon_image.png";
import tropical_image from "./tropical_image.png";

export const assets = {
  logo,
  search_icon,
  remove_icon,
  arrow_right_icon_colored,
  star_icon,
  star_dull_icon,
  cart_icon,
  nav_cart_icon,
  add_icon,
  refresh_icon,
  product_list_icon,
  order_icon,
  upload_area,
  profile_icon,
  menu_icon,
  delivery_truck_icon,
  leaf_icon,
  coin_icon,
  trust_icon,
  black_arrow_icon,
  white_arrow_icon,
  main_banner_bg,
  main_banner_bg_sm,
  bottom_banner_image,
  bottom_banner_image_sm,
  add_address_iamge,
  box_icon,
};

export const categories = [
  { text: "Seasonal Fruits", path: "Seasonal", image: mango_image_1, bgColor: "#FEF6DA" },
  { text: "Exotic Fruits", path: "Exotic", image: banana_image_1, bgColor: "#FEE0E0" },
  { text: "Citrus Fruits", path: "Citrus", image: orange_image, bgColor: "#F0F5DE" },
  { text: "Berries", path: "Berries", image: grapes_image_1, bgColor: "#E1F5EC" },
  { text: "Juice-Grade", path: "Juice-Grade", image: apple_image, bgColor: "#E0F6FE" },
  { text: "Melons", path: "Melons", image: melon_image, bgColor: "#F5E6FA" },
  { text: "Tropical", path: "Tropical", image: tropical_image, bgColor: "#FFF0E6" }
];

export const footerLinks = [
  {
    title: "Quick Links",
    links: [
      { text: "Home", url: "#" },
      { text: "Best Sellers", url: "#" },
      { text: "Offers & Deals", url: "#" },
      { text: "Contact Us", url: "#" },
      { text: "FAQs", url: "#" },
    ],
  },
  {
    title: "Need help?",
    links: [
      { text: "Delivery Information", url: "#" },
      { text: "Return & Refund Policy", url: "#" },
      { text: "Payment Methods", url: "#" },
      { text: "Track your Order", url: "#" },
      { text: "Contact Us", url: "#" },
    ],
  },
  {
    title: "Follow Us",
    links: [
      { text: "Instagram", url: "#" },
      { text: "Twitter", url: "#" },
      { text: "Facebook", url: "#" },
      { text: "YouTube", url: "#" },
    ],
  },
];

export const features = [
  {
    icon: delivery_truck_icon,
    title: "Fastest Delivery",
    description: "Fruits delivered in under 30 minutes.",
  },
  {
    icon: leaf_icon,
    title: "Freshness Guaranteed",
    description: "Fresh produce straight from the source.",
  },
  {
    icon: coin_icon,
    title: "Affordable Prices",
    description: "Quality fruits at unbeatable prices.",
  },
  {
    icon: trust_icon,
    title: "Trusted by Thousands",
    description: "Loved by happy customers.",
  },
];

export const dummyProducts = [
  {
    _id: "fruzo_001",
    name: "Ratnagiri Alphonso Mangoes",
    category: "Seasonal",
    price: 1200,
    offerPrice: 950,
    image: [mango_image_1],
    description: [
      "Premium export-quality Alphonso mangoes.",
      "Naturally ripened and incredibly sweet.",
      "Direct from Ratnagiri farms."
    ],
    createdAt: "2026-04-21T07:17:46.018Z",
    updatedAt: "2026-04-21T07:18:13.103Z",
    inStock: true,
  }
];

export const dummyAddress = [
  {
    _id: "67b5b9e54ea97f71bbc196a0",
    userId: "67b5880e4d09769c5ca61644",
    firstName: "Test",
    lastName: "User",
    email: "user@fruzo.com",
    street: "Street 123",
    city: "Mumbai",
    state: "MH",
    zipcode: 400001,
    country: "IN",
    phone: "1234567890",
  },
];

export const dummyOrders = [];