import { Routes, Route } from "react-router";

import Home from "../Pages/Home.jsx";

import Cart from "../Pages/Cart.jsx";

function AllRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Checkout/cart" element={<Cart />} />
    </Routes>
  );
}

export default AllRoutes;
