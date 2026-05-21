import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {

    const {setShowUserLogin, setUser, axios, navigate} = useAppContext()

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [otp, setOtp] = React.useState("");

    const onSubmitHandler = async (event)=>{
        try {
            event.preventDefault();

            if (state === "login") {
                // 🚀 FIXED: Now logging in with EMAIL instead of Phone
                const {data} = await axios.post(`/api/user/login`, { email, password });

                if (data.success){
                    navigate('/');
                    setUser(data.user);
                    setShowUserLogin(false);
                    toast.success("Logged in successfully");
                } else {
                    toast.error(data.message);
                }
            } 
            else if (state === "register") {
                // 🚀 Send data to trigger Email OTP
                const {data} = await axios.post(`/api/user/register`, { name, phone, email, password });

                if (data.success){
                    toast.success("OTP sent to your Email!");
                    setState("verify"); 
                } else {
                    toast.error(data.message);
                }
            } 
            else if (state === "verify") {
                // 🚀 Verify OTP using EMAIL
                const {data} = await axios.post(`/api/user/verify-registration`, { email, otp });

                if (data.success){
                    navigate('/');
                    setUser(data.user);
                    setShowUserLogin(false);
                    toast.success("Account created successfully!");
                } else {
                    toast.error(data.message);
                }
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

  return (
    <div onClick={()=> setShowUserLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center text-sm text-gray-600 bg-black/50 backdrop-blur-sm'>

      <form onSubmit={onSubmitHandler} onClick={(e)=>e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-10 w-80 sm:w-[360px] rounded-2xl shadow-2xl border border-gray-200 bg-white transition-all">
          
            <p className="text-2xl font-medium m-auto mb-2 text-center w-full">
                <span className="text-primary">User</span> {state === "login" ? "Login" : state === "verify" ? "Verification" : "Sign Up"}
            </p>
            
            {state === "verify" && (
                <div className="w-full text-center text-sm text-gray-500 mb-2">
                    <p>Enter the 6-digit OTP sent to</p>
                    <p className="font-bold text-gray-800 bg-gray-100 py-1 px-2 rounded mt-1 inline-block">{email}</p>
                </div>
            )}

            {/* OTP INPUT FOR VERIFY STATE */}
            {state === "verify" && (
                <div className="w-full">
                    <input onChange={(e) => setOtp(e.target.value)} value={otp} placeholder="------" className="border border-gray-300 rounded-lg w-full p-3 mt-1 outline-primary focus:ring-2 focus:ring-primary/20 text-center tracking-[1em] font-bold text-2xl bg-gray-50" type="text" maxLength="6" required />
                </div>
            )}

            {/* NAME FOR REGISTER STATE */}
            {state === "register" && (
                <div className="w-full">
                    <p className="font-medium text-gray-700">Full Name</p>
                    <input onChange={(e) => setName(e.target.value)} value={name} placeholder="John Doe" className="border border-gray-300 rounded-lg w-full p-2.5 mt-1 outline-primary focus:bg-white bg-gray-50" type="text" required />
                </div>
            )}

            {/* EMAIL FOR LOGIN/REGISTER STATES */}
            {(state === "login" || state === "register") && (
                <div className="w-full">
                    <p className="font-medium text-gray-700">Email Address</p>
                    <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder="john@example.com" className="border border-gray-300 rounded-lg w-full p-2.5 mt-1 outline-primary focus:bg-white bg-gray-50" type="email" required />
                </div>
            )}

            {/* PHONE FOR REGISTER STATE ONLY (Needed for WhatsApp) */}
            {state === "register" && (
                <div className="w-full">
                    <p className="font-medium text-gray-700 flex justify-between">
                        <span>WhatsApp Number</span>
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Required</span>
                    </p>
                    <input onChange={(e) => setPhone(e.target.value)} value={phone} placeholder="9876543210" className="border border-gray-300 rounded-lg w-full p-2.5 mt-1 outline-primary focus:bg-white bg-gray-50" type="tel" required />
                    <p className="text-[10px] text-gray-400 mt-1">We need this for delivery & WhatsApp updates.</p>
                </div>
            )}

            {/* PASSWORD FOR LOGIN/REGISTER STATES */}
            {(state === "login" || state === "register") && (
                <div className="w-full ">
                    <p className="font-medium text-gray-700">Password</p>
                    <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="••••••••" className="border border-gray-300 rounded-lg w-full p-2.5 mt-1 outline-primary focus:bg-white bg-gray-50" type="password" required />
                </div>
            )}

            {/* FOOTER LINKS */}
            {state === "register" ? (
                <p className="text-sm mt-1 w-full text-center border-t pt-4">
                    Already have an account? <span onClick={() => setState("login")} className="text-primary font-bold cursor-pointer hover:underline">Log in</span>
                </p>
            ) : state === "login" ? (
                <p className="text-sm mt-1 w-full text-center border-t pt-4">
                    Need an account? <span onClick={() => setState("register")} className="text-primary font-bold cursor-pointer hover:underline">Sign up</span>
                </p>
            ) : (
                <p className="text-sm mt-1 w-full text-center">
                    <span onClick={() => setState("register")} className="text-gray-500 font-medium cursor-pointer hover:text-gray-800">← Change Email</span>
                </p>
            )}

            <button className="bg-primary hover:bg-primary-dull transition-all text-white font-semibold text-base w-full py-3 mt-1 rounded-lg cursor-pointer shadow-md">
                {state === "register" ? "Send Verification Email" : state === "verify" ? "Create Account" : "Login"}
            </button>
        </form>
    </div>
  )
}

export default Login