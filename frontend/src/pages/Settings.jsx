import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Lock, 
  Key, 
  ChevronDown,
  LockKeyhole
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState(user?.settings?.notifications?.driverReminders !== false);

  // Form States
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email
      });
      setReminders(user.settings?.notifications?.driverReminders !== false);
    }
  }, [user]);

  const handleToggleReminders = async () => {
    const newVal = !reminders;
    setReminders(newVal);
    try {
      await updateProfile({
        settings: {
          notifications: {
            driverReminders: newVal
          }
        }
      });
      toast.success(newVal ? 'Reminders enabled' : 'Reminders disabled');
    } catch (err) {
      setReminders(!newVal); // Rollback
      toast.error('Failed to update notification settings');
    }
  };

  const tabs = [
    { id: 'general', icon: Globe, label: 'General' },
    { id: 'account', icon: User, label: 'Account' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name: profileData.name });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await updateProfile({
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-fade-in text-left pb-16">
      {/* Settings Navigation Sidebar */}
      <div className="lg:w-72 shrink-0 space-y-10">
         <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Configuration</h3>
            <nav className="space-y-1">
               {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all font-black text-[11px] uppercase tracking-widest ${
                      activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {tab.label}
                  </button>
               ))}
            </nav>
         </div>
      </div>

      {/* Settings Content Terminal */}
      <div className="flex-1 max-w-4xl space-y-12">
        {activeTab === 'general' && (
          <section className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">General Settings</h2>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-tight mt-2 opacity-70">Manage your organization's core profile and localization settings.</p>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="bg-white border border-slate-200 rounded-md p-8 shadow-sm space-y-8">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Business Name</label>
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="input-pro !border-slate-200" 
                  required
                />
              </div>
              
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Currency</label>
                <div className="relative">
                  <input type="text" value="₦ Nigerian Naira" disabled className="input-pro bg-slate-50 !border-slate-100 italic cursor-not-allowed text-slate-400" />
                  <LockKeyhole className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                 <Button type="submit" variant="secondary" loading={loading} className="px-10 py-4 uppercase font-black tracking-widest text-[11px]">
                    Save Changes
                 </Button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'account' && (
          <section className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Account & Security</h2>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-tight mt-2 opacity-70">Update your credentials and manage authentication protocols.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-md p-8 shadow-sm space-y-10">
              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10 border-b border-slate-100">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input-pro !border-slate-200" 
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Email Address</label>
                  <input type="email" value={profileData.email} disabled className="input-pro bg-slate-50 !border-slate-100 cursor-not-allowed opacity-60" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                   <Button type="submit" variant="secondary" loading={loading} className="px-10 py-4 uppercase font-black tracking-widest text-[11px]">
                      Update Profile
                   </Button>
                </div>
              </form>

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-50 mt-10">
                   <Key className="w-4 h-4 text-slate-400" />
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.1em]">Change Password</h3>
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="input-pro !border-slate-200 max-w-md" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="input-pro !border-slate-200" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Confirm Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="input-pro !border-slate-200" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                   <Button type="submit" variant="primary" loading={loading} className="px-10 py-4 uppercase font-black tracking-widest text-[11px] !bg-emerald-600 hover:!bg-emerald-700">
                      Save New Password
                   </Button>
                </div>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'notifications' && (
          <section className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Notifications</h2>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-tight mt-2 opacity-70">Configure automated alerts and reporting delivery schedules.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-md p-8 shadow-sm">
               <div className="flex items-center justify-between group">
                  <div>
                     <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight line-clamp-1">Driver payment weekly reminder</h4>
                     <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase opacity-60">Receive an automated manifest for weekly driver settlements.</p>
                  </div>
                  <button 
                    onClick={handleToggleReminders}
                    className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 shrink-0 ${reminders ? 'bg-emerald-600' : 'bg-slate-200'}`}
                  >
                     <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${reminders ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
               </div>
               
               {reminders && (
                 <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500">
                   <div className="flex items-center justify-between">
                     <div className="max-w-md">
                        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Manual Verification</h5>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase opacity-60">Dispatch a test version of the weekly manifest to your inbox immediately.</p>
                     </div>
                     <Button 
                       variant="secondary" 
                       size="sm" 
                       onClick={async () => {
                         try {
                           setLoading(true);
                           await axios.post('/notifications/trigger-weekly');
                           toast.success('Test manifest dispatched to your inbox');
                         } catch (err) {
                           toast.error('Failed to dispatch test manifest');
                         } finally {
                           setLoading(false);
                         }
                       }}
                       loading={loading}
                       className="text-[9px] font-black uppercase tracking-widest px-4"
                     >
                       Send Test Manifest Now
                     </Button>
                   </div>
                 </div>
               )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Settings;
