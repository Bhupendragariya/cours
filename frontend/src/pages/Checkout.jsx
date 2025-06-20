import { useState } from "react";
import { CountrySelect, StateSelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import { Link } from "react-router-dom";
import axios from 'axios';


function Checkout() {
  const [countryId, setCountryId] = useState("india");
  const [stateId, setStateId] = useState("");
  const [coupon, setCoupon] = useState("");
  const [selected, setSelected] = useState("office");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    duration: "3 Month",
    postcode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(" submit form and ", formData);
  };

  const handleApply = () => {
    alert(`Applied Coupon: ${coupon}`);
  };


  async function Order() {
    try {
      const response = await axios.put(`http://localhost:5000/app/v1/user/purchase`, {})
      console.log('Purchase successful:', response.data);
      
    } catch (error) {
      console.error('Error setting up the request:', error.message);
    }
     
  }

  return (
    <>
      <div className="flex  mx-auto gap-5 flex-col md:flex-row  ">
        <div className="border  rounded-xl w-full mx-auto pt-8">
          <h1 className="text-center items-center text-2xl ">
            Billing details
          </h1>

          <div className="w-50%  mx-5 mt-10">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === "Male"}
                      onChange={handleChange}
                      required
                      className="form-radio text-blue-500"
                    />
                    <span>Male</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === "Female"}
                      onChange={handleChange}
                      required
                      className="form-radio text-blue-500"
                    />
                    <span>Female</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="gender"
                      value="Other"
                      checked={formData.gender === "Other"}
                      onChange={handleChange}
                      required
                      className="form-radio text-blue-500"
                    />
                    <span>Other</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700"
                >
                  Duration <span className="text-red-500">*</span>
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>3 Month</option>
                  <option>6 Month</option>
                  
                </select>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  Country / Region <span className="text-red-500">*</span>
                </label>
                <CountrySelect
                  id="country"
                  value={countryId}
                  required
                  onChange={(e) => {
                    setCountryId(e.id);
                    setStateId("");
                  }}
                  placeholder="Select Country"
                  className="!border-none !outline-none rounded-none "
                />
              </div>

              {countryId && (
                <div className="mb-6">
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State / Province <span className="text-red-500">*</span>
                  </label>
                  <StateSelect
                    id="state"
                    countryid={countryId}
                    value={stateId}
                    required
                    onChange={(e) => setStateId(e.id)}
                    placeholder="Select State"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="postcode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Postcode / ZIP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postcode"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>
          </div>
        </div>

        {/* second info */}

        <div className="border  rounded-xl w-full mx-auto pt-8">
          <h1 className="text-center items-center text-2xl ">Apply Coupon</h1>

          <div className=" w-50%  mx-5 mt-10">
            <div className="relative">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 "
              />
              <button
                onClick={handleApply}
                className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-r-md hover:bg-blue-700 absolute right-2 top-2 "
              >
                Apply
              </button>
            </div>

            <div className="my-8">
              <p>If you have a coupon code, please apply it below.</p>

              <h2 className="text-2xl my-7 font-semibold">Your Order</h2>

              <div className="flex gap-3">
                <img
                  src="https://internship.novanectar.co.in/wp-content/uploads/2025/06/cyber-security.jpeg-300x300.jpg"
                  alt="img"
                  className="w-30 h-30 rounded-md"
                />
                <div className="flex flex-col gap-3 mt-4">
                  <p className="text-xl font-semibold ">Cyber Security</p>
                  <p className="text-xl font-semibold">₹ 59999</p>
                </div>
              </div>
            </div>

            <hr />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between mt-5 mb-2">
                <p className="text-2xl  font-sans">Subtotal</p>
                <p className="text-2xl  font-sans">₹11,998.00</p>
              </div>
              <div className="flex items-center justify-between mb-2 ">
                <p className="text-2xl  font-sans">Via wallet</p>
                <p className="text-2xl  font-sans">₹11,998.00</p>
              </div>
            </div>
            <hr />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between mt-5 mb-2">
                <p className="text-2xl  font-sans">Total </p>
                <p className="text-2xl  font-sans">₹11,998.00</p>
              </div>
              <div className="flex items-center justify-between mb-2 ">
                <p className="text-2xl  font-sans">Pay by wallet </p>
                <input type="checkbox" className="accent-blue-500" />
              </div>
            </div>

            <div className=" mt-8 border border-amber-200 rounded-md ">
              <div className="px-8 py-7">
                <label className="flex items-center gap-2 ">
                  <input
                    type="radio"
                    name="payment"
                    checked={selected === "office"}
                    onChange={() => setSelected("office")}
                    className="accent-blue-500"
                  />
                  <span className="text-lg font-medium">Pay In Office</span>
                </label>
                {selected === "office" && (
                  <div className="relative bg-gray-100 rounded-md px-4 py-3 ml-6 mt-2">
                    <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-100 rotate-45 transform origin-center"></div>
                    <p className="text-gray-800">Pay With Cash In Office.</p>
                  </div>
                )}
              </div>
            </div>

            <div className=" border border-amber-200 rounded-md ">
              <div className="px-8 py-7">
                <label className="flex items-center gap-2 ">
                  <input
                    type="radio"
                    name="payment"
                    checked={selected === "online"}
                    onChange={() => setSelected("online")}
                    className="accent-blue-500"
                  />
                  <span className="text-lg font-medium">
                    Credit Card/Debit Card/NetBanking
                  </span>
                </label>
                {selected === "online" && (
                  <div className="relative bg-gray-100 rounded-md px-4 py-3 ml-6 mt-2">
                    <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-100 rotate-45 transform origin-center"></div>
                    <p className="text-gray-800">
                      Pay securely by Credit or Debit card or Internet Banking
                      through Razorpay.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="my-5 text-md">
              Your personal data will be used to process your order, support
              your experience throughout this website, and for other purposes
              described in our <Link to="/policy"> privacy policy.</Link>
            </p>

            <button
              onClick={Order}
              className="text-xl text-white bg-blue-700 w-full py-3 rounded-md my-5"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
