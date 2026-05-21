import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { assets } from '../assets/assets';

const MyProfile = () => {
    const { user, setUser, axios, navigate } = useAppContext();

    // Profile Edit States
    const [isEdit, setIsEdit] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    // Address States
    const [addresses, setAddresses] = useState([]);
    const [defaultAddress, setDefaultAddress] = useState('');

    // Password Reset States
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordStep, setPasswordStep] = useState('request');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Instant Local Image Preview State
    const [imagePreview, setImagePreview] = useState(null);

    const fetchAddresses = async () => {
        try {
            const { data } = await axios.get('/api/address/get');
            if (data.success) {
                setAddresses(data.addresses);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setEmail(user.email || '');
            setDefaultAddress(user.defaultAddress?._id || user.defaultAddress || '');
            fetchAddresses();
        }
    }, [user]);

    const updateUserProfileData = async () => {
        try {
            const { data } = await axios.post('/api/user/update-profile', {
                userId: user._id,
                name,
                phone,
                email,
                defaultAddress: defaultAddress === '' ? null : defaultAddress
            });

            if (data.success) {
                toast.success(data.message);
                setUser(data.user);
                setIsEdit(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const deleteSavedAddress = async (addressId) => {
        try {
            const { data } = await axios.post('/api/address/delete', { addressId });

            if (data.success) {
                toast.success("Address deleted successfully");
                fetchAddresses(); 
                
                if (defaultAddress === addressId) {
                    setDefaultAddress('');
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // ==========================================
    // PASSWORD RESET USING EMAIL
    // ==========================================
    const sendPasswordOtp = async () => {
        if (!user.email) return toast.error("No email associated with this account!");
        
        const toastId = toast.loading("Sending OTP to your email...");
        try {
            const { data } = await axios.post('/api/user/send-reset-otp', { email: user.email });

            if (data.success) {
                toast.success("OTP sent to your email!", { id: toastId });
                setPasswordStep('verify');
            } else {
                toast.error(data.message, { id: toastId });
            }
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    const submitNewPassword = async () => {
        if (!otp || !newPassword) return toast.error("Please enter both OTP and new password.");
        if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");

        const toastId = toast.loading("Updating password...");
        try {
            const { data } = await axios.post('/api/user/reset-password', {
                email: user.email,
                otp,
                newPassword
            });

            if (data.success) {
                toast.success(data.message, { id: toastId });
                setIsChangingPassword(false);
                setPasswordStep('request');
                setOtp('');
                setNewPassword('');
            } else {
                toast.error(data.message, { id: toastId });
            }
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    // ==========================================
    // 🚀 FIXED: SINGLE PHOTO UPLOAD FUNCTION
    // ==========================================
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. INSTANT LOCAL PREVIEW
        setImagePreview(URL.createObjectURL(file));

        const toastId = toast.loading("Uploading to server... Please do not refresh!");
        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', user._id);

        try {
            const { data } = await axios.post('/api/user/update-photo', formData);
            if(data.success) {
                toast.success("Photo permanently saved!", { id: toastId });
                setUser(data.user); 
                
                // Remove local illusion so it strictly uses the REAL URL from Cloudinary
                setImagePreview(null);
            } else {
                toast.error(data.message || "Failed to save photo", { id: toastId });
                setImagePreview(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Server Error: Check Terminal", { id: toastId });
            setImagePreview(null);
        }
        
        e.target.value = null; 
    };

    const handlePhotoRemove = async () => {
        const toastId = toast.loading("Removing photo...");
        try {
            const { data } = await axios.post('/api/user/remove-photo', { userId: user._id });
            if(data.success) {
                toast.success(data.message, { id: toastId });
                setUser(data.user);
                setImagePreview(null);
            } else {
                toast.error(data.message, { id: toastId });
            }
        } catch (error) {
            toast.error(error.message, { id: toastId });
        }
    };

    if (!user) return <div className="mt-20 text-center flex justify-center items-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>;

    const currentDefaultAddressObj = addresses.find(addr => addr._id === (user.defaultAddress?._id || user.defaultAddress));

    return (
        <div className="max-w-3xl mx-auto mt-16 p-4 sm:p-6 md:p-10 bg-white border border-gray-200 rounded-xl shadow-sm mb-20">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">My Profile</h1>

            {/* PHOTO UPLOAD UI BLOCK */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
                <img 
                    src={imagePreview || user.profilePhoto || assets.profile_icon} 
                    alt="Profile" 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-gray-300 object-cover shadow-sm bg-white" 
                />
            
                <div className="flex flex-col items-center sm:items-start gap-2">
                    <label className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm hover:bg-green-700 transition cursor-pointer font-medium shadow-sm text-center">
                        Upload New Photo
                        <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                    {user.profilePhoto && (
                        <button onClick={handlePhotoRemove} className="text-sm text-red-500 hover:text-red-700 transition font-medium px-2 py-1">
                            Remove Photo
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-6 text-sm text-gray-700">
                {/* PROFILE DETAILS SECTION */}
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-col gap-5 sm:gap-6">
                        
                        {/* Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <p className="font-semibold text-gray-800 sm:w-1/4">Name:</p>
                            <div className="sm:w-3/4">
                                {isEdit ? (
                                    <input className="bg-gray-50 focus:bg-white border border-gray-300 rounded-lg px-3 py-2.5 outline-primary w-full max-w-md transition" type="text" value={name} onChange={e => setName(e.target.value)} />
                                ) : (
                                    <p className="text-gray-600 text-base">{user.name}</p>
                                )}
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <p className="font-semibold text-gray-800 sm:w-1/4">Phone (WhatsApp):</p>
                            <div className="sm:w-3/4">
                                {isEdit ? (
                                    <input className="bg-gray-50 focus:bg-white border border-gray-300 rounded-lg px-3 py-2.5 outline-primary w-full max-w-md transition" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                                ) : (
                                    <p className="text-gray-600">{user.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                            <p className="font-semibold text-gray-800 sm:w-1/4">Email:</p>
                            <div className="sm:w-3/4">
                                {isEdit ? (
                                    <input className="bg-gray-50 focus:bg-white border border-gray-300 rounded-lg px-3 py-2.5 outline-primary w-full max-w-md transition" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled title="Email cannot be changed directly" />
                                ) : (
                                    <p className="text-gray-600 bg-gray-50 px-3 py-1 rounded inline-block">{user.email || "No email provided"}</p>
                                )}
                            </div>
                        </div>

                        {/* Default Address */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                            <p className="font-semibold text-gray-800 sm:w-1/4 sm:mt-2">Default Address:</p>
                            <div className="sm:w-3/4 w-full max-w-md">
                                {isEdit ? (
                                    <div className="w-full">
                                        {addresses.length > 0 ? (
                                            <select 
                                                value={defaultAddress} 
                                                onChange={(e) => setDefaultAddress(e.target.value)}
                                                className="bg-gray-50 focus:bg-white border border-gray-300 rounded-lg px-3 py-2.5 outline-primary w-full text-sm mb-4 cursor-pointer transition"
                                            >
                                                <option value="">-- Do not set a default --</option>
                                                {addresses.map((addr) => (
                                                    <option key={addr._id} value={addr._id}>
                                                        {addr.street}, {addr.city}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="text-xs text-orange-500 bg-orange-50 p-2 border border-orange-200 rounded-md mb-4 mt-2 font-medium">Add an address below before setting a default.</p>
                                        )}

                                        <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 space-y-3 w-full">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Manage Saved Addresses</p>
                                            
                                            {addresses.map(addr => (
                                                <div key={addr._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white border border-gray-200 rounded-md text-sm gap-2 sm:gap-0 shadow-sm">
                                                    <span className="truncate pr-4 font-medium text-gray-700">{addr.street}, {addr.city}</span>
                                                    <button onClick={() => deleteSavedAddress(addr._id)} className="text-red-500 font-bold hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition self-start sm:self-auto border border-transparent hover:border-red-200">Delete</button>
                                                </div>
                                            ))}

                                            <button onClick={() => navigate('/add-address')} className="w-full mt-2 py-2.5 border-2 border-dashed border-primary text-primary rounded-lg text-sm font-bold hover:bg-primary/5 transition">
                                                + Add New Address
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-600 sm:mt-2">
                                        {currentDefaultAddressObj ? `${currentDefaultAddressObj.street}, ${currentDefaultAddressObj.city}` : "No default set"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        {isEdit ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={updateUserProfileData} className="border border-primary bg-primary text-white px-8 py-2.5 rounded-lg font-bold hover:bg-green-700 transition shadow-sm w-full sm:w-auto">Save Information</button>
                                <button onClick={() => { setIsEdit(false); setDefaultAddress(user.defaultAddress?._id || user.defaultAddress || ''); fetchAddresses(); }} className="border border-gray-300 px-8 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition w-full sm:w-auto">Cancel</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEdit(true)} className="border border-primary text-primary px-8 py-2.5 rounded-lg font-bold hover:bg-primary hover:text-white transition w-full sm:w-auto">Edit Profile Data</button>
                        )}
                    </div>
                </div>

                {/* SECURITY & PASSWORD SECTION */}
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm mt-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Security Settings</h2>
                    
                    {!isChangingPassword ? (
                        <button onClick={() => setIsChangingPassword(true)} className="text-white bg-gray-800 hover:bg-black font-medium px-6 py-2.5 rounded-lg transition shadow-sm">
                            Change Account Password
                        </button>
                    ) : (
                        <div className="bg-gray-50 p-5 sm:p-6 rounded-lg border border-gray-200 w-full">
                            <h3 className="font-bold text-gray-800 mb-3 text-lg">Reset Your Password</h3>
                            
                            {passwordStep === 'request' ? (
                                <div>
                                    <p className="text-sm text-gray-600 mb-5">
                                        To protect your account, we will send a One-Time Password (OTP) to your registered email: <br/>
                                        <span className="font-bold text-gray-800 bg-white border border-gray-200 px-2 py-1 rounded inline-block mt-2">{user.email}</span>
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={sendPasswordOtp} className="bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:bg-green-700 transition shadow-sm flex-1 sm:flex-none">
                                            Send Email OTP
                                        </button>
                                        <button onClick={() => setIsChangingPassword(false)} className="border border-gray-300 bg-white font-bold px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition flex-1 sm:flex-none">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 max-w-md">
                                    <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-xs font-medium">
                                        We've sent a 6-digit OTP to <b>{user.email}</b>. Please check your inbox (and spam folder).
                                    </div>
                                    
                                    <input 
                                        type="text" 
                                        placeholder="Enter 6-digit OTP" 
                                        value={otp} 
                                        onChange={e => setOtp(e.target.value)} 
                                        className="border border-gray-300 rounded-lg px-4 py-3 outline-primary w-full text-center tracking-[0.5em] font-bold text-xl" 
                                        maxLength="6" 
                                    />
                                    <input 
                                        type="password" 
                                        placeholder="Create New Password (min 6 chars)" 
                                        value={newPassword} 
                                        onChange={e => setNewPassword(e.target.value)} 
                                        className="border border-gray-300 rounded-lg px-4 py-3 outline-primary w-full font-medium" 
                                    />
                                    
                                    <div className="flex gap-3 mt-2">
                                        <button onClick={submitNewPassword} className="bg-primary text-white font-bold px-6 py-2.5 rounded-lg hover:bg-green-700 transition shadow-sm flex-1 sm:flex-none">
                                            Verify & Update Password
                                        </button>
                                        <button onClick={() => {setPasswordStep('request'); setIsChangingPassword(false)}} className="border border-gray-300 bg-white font-bold px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 transition flex-1 sm:flex-none">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyProfile;