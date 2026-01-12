// react
// css
import "./App.css";
// Cart Provider
import { CartProvider } from "./context/CartContext";
// browserrouter
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// Components
import Footer from "./Component/Footer";
import Header from "./Component/Header";
// pages
import Home from "./pages/Home";
// About pages
import AboutUs from "./pages/About/AboutUs";
import Blog from "./pages/About/Blog";
import BlogCategory from "./pages/About/BlogCategory";
import Contact from "./pages/About/Contact";
// Shop pages
import Shop from "./pages/Shop/Shop";
import ShopCart from "./pages/Shop/ShopCart";
import ShopCheckOut from "./pages/Shop/ShopCheckOut";
import ShopGridCol3 from "./pages/Shop/ShopGridCol3";
import ShopListCol from "./pages/Shop/ShopListCol";
import ShopWishList from "./pages/Shop/ShopWishList";
// Store pages
import SingleShop from "./pages/store/SingleShop";
import StoreList from "./pages/store/StoreList";
// Account pages
import MyAcconutNotification from "./pages/Accounts/MyAcconutNotification";
import MyAcconutPaymentMethod from "./pages/Accounts/MyAcconutPaymentMethod";
import MyAccountSetting from "./pages/Accounts/MyAcconutSetting";
import MyAccountAddress from "./pages/Accounts/MyAccountAddress";
import MyAccountForgetPassword from "./pages/Accounts/MyAccountForgetPassword";
import MyAccountOrder from "./pages/Accounts/MyAccountOrder";
import MyAccountSignIn from "./pages/Accounts/MyAccountSignIn";
import MyAccountSignUp from "./pages/Accounts/MyAccountSignUp";
import Careers from "./pages/FooterElements/Careers";
import Coupons from "./pages/FooterElements/Coupons";
import FAQ from "./pages/FooterElements/Faq";
import HelpCenter from "./pages/FooterElements/HelpCenter";
const App = () => {
  return (
    <div>
      <CartProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Shop pages */}
            <Route path="/Shop" element={<Shop />} />
            <Route path="/ShopGridCol3" element={<ShopGridCol3 />} />
            <Route path="/ShopListCol" element={<ShopListCol />} />
            <Route path="/ShopWishList" element={<ShopWishList />} />
            <Route path="/ShopCheckOut" element={<ShopCheckOut />} />
            <Route path="/ShopCart" element={<ShopCart />} />
            {/* Store pages */}
            <Route path="/StoreList" element={<StoreList />} />
            <Route path="/SingleShop" element={<SingleShop />} />
            {/* Accounts pages */}
            <Route path="/MyAccountOrder" element={<MyAccountOrder />} />
            <Route path="/MyAccountSetting" element={<MyAccountSetting />} />
            <Route
              path="/MyAcconutNotification"
              element={<MyAcconutNotification />}
            />
            <Route
              path="/MyAcconutPaymentMethod"
              element={<MyAcconutPaymentMethod />}
            />
            <Route path="/MyAccountAddress" element={<MyAccountAddress />} />
            <Route
              path="/MyAccountForgetPassword"
              element={<MyAccountForgetPassword />}
            />
            <Route path="/MyAccountSignIn" element={<MyAccountSignIn />} />
            <Route path="/MyAccountSignUp" element={<MyAccountSignUp />} />
            {/* About pages */}
            <Route path="/Blog" element={<Blog />} />
            <Route path="/BlogCategory" element={<BlogCategory />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/AboutUs" element={<AboutUs />} />
            {/* Footer Elements */}
            <Route path="/Faq" element={<FAQ />} />
            <Route path="/Coupons" element={<Coupons />} />
            <Route path="/Careers" element={<Careers />} />
            <Route path="/helpcenter" element={<HelpCenter />} />
          </Routes>
          <Footer />
        </Router>
      </CartProvider>
    </div>
  );
};

export default App;
