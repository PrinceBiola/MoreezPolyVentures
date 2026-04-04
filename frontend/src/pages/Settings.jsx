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
    <div className="flex flex-col lg:flex-row gap-6 md:gap-10 animate-fade-in text-left pb-16">
      {/* Settings Navigation Sidebar */}
      <div className="lg:w-72 shrink-0">
         <div className="bg-white border border-border-light rounded-2xl p-4 md:p-6 lg:p-0 lg:bg-transparent lg:border-0 lg:rounded-none lg:shadow-none">
            <h3 className="hidden lg:block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6">Configuration</h3>
            <nav className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar lg:space-y-1">
               {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl lg:rounded-md transition-all font-black text-[10px] md:text-[11px] uppercase tracking-widest whitespace-nowrap ${
                      activeTab === tab.id ? 'bg-primary/10 text-primary border border-primary/20 lg:border-0' : 'text-text-muted hover:bg-neutral hover:text-text-main border border-transparent'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'text-text-muted'}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.id === 'notifications' ? 'Alerts' : tab.label}</span>
                  </button>
               ))}
            </nav>
         </div>
      </div>

      {/* Settings Content Terminal */}
      <div className="flex-1 max-w-4xl space-y-12">
        {activeTab === 'general' && (
          <section className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-text-main tracking-tighter uppercase leading-none">General Settings</h2>
              <p className="text-text-muted font-bold text-[9px] md:text-[11px] uppercase tracking-tight mt-2 opacity-70">Manage your organization's core profile and localization settings.</p>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="bg-white border border-border-light rounded-2xl p-6 md:p-8 shadow-sm space-y-6 md:space-y-8">
              <div>
                <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Business Name</label>
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="input-pro !border-border-light bg-neutral/10 focus:bg-white transition-all" 
                  required
                />
              </div>
              
              <div>
                <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Currency</label>
                <div className="relative">
                  <input type="text" value="₦ Nigerian Naira" disabled className="input-pro bg-neutral !border-border-light italic cursor-not-allowed text-text-muted opacity-60" />
                  <LockKeyhole className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted opacity-40" />
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
          <section className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-text-main tracking-tighter uppercase leading-none">Account & Security</h2>
              <p className="text-text-muted font-bold text-[9px] md:text-[11px] uppercase tracking-tight mt-2 opacity-70">Update your credentials and manage authentication protocols.</p>
            </div>

            <div className="bg-white border border-border-light rounded-2xl p-6 md:p-8 shadow-sm space-y-10">
              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10 border-b border-border-light">
                <div>
                  <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input-pro !border-border-light bg-neutral/10 focus:bg-white transition-all !py-3" 
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Email Address</label>
                  <input type="email" value={profileData.email} disabled className="input-pro bg-neutral !border-border-light cursor-not-allowed opacity-60" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                   <Button type="submit" variant="secondary" loading={loading} className="px-10 py-4 uppercase font-black tracking-widest text-[11px]">
                      Update Profile
                   </Button>
                </div>
              </form>

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-border-light mt-10">
                   <Key className="w-4 h-4 text-text-muted opacity-60" />
                   <h3 className="text-xs font-black text-text-main uppercase tracking-[0.1em]">Change Password</h3>
                </div>
                
                <div>
                  <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="input-pro !border-border-light bg-neutral/10 focus:bg-white transition-all max-w-md" 
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="input-pro !border-border-light bg-neutral/10 focus:bg-white transition-all" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-text-muted uppercase mb-2 block tracking-widest text-left">Confirm Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="input-pro !border-border-light bg-neutral/10 focus:bg-white transition-all" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                   <Button type="submit" variant="primary" loading={loading} className="px-10 py-4 uppercase font-black tracking-widest text-[11px] !bg-primary hover:!bg-accent shadow-lg shadow-primary/20">
                      Save New Password
                   </Button>
                </div>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'notifications' && (
          <section className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-6 duration-700">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-text-main tracking-tighter uppercase leading-none">Notifications</h2>
              <p className="text-text-muted font-bold text-[9px] md:text-[11px] uppercase tracking-tight mt-2 opacity-70">Configure automated alerts and reporting delivery schedules.</p>
            </div>

            <div className="bg-white border border-border-light rounded-2xl p-6 md:p-8 shadow-sm">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                  <div className="text-left">
                     <h4 className="text-[13px] font-black text-text-main uppercase tracking-tight">Driver payment weekly reminder</h4>
                     <p className="text-[10px] text-text-muted font-bold mt-1.5 uppercase opacity-60 leading-relaxed">Receive an automated manifest for weekly driver settlements.</p>
                  </div>
                  <button 
                    onClick={handleToggleReminders}
                    className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 shrink-0 ${reminders ? 'bg-primary' : 'bg-neutral'}`}
                  >
                     <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${reminders ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
               </div>
               
               {reminders && (
                 <div className="mt-8 pt-8 border-t border-border-light animate-in fade-in slide-in-from-top-2 duration-500">
                   <div className="flex items-center justify-between">
                     <div className="max-w-md text-left">
                        <h5 className="text-[11px] font-black text-text-main uppercase tracking-tight">Manual Verification</h5>
                        <p className="text-[10px] text-text-muted font-bold mt-1 uppercase opacity-60">Dispatch a test version of the weekly manifest to your inbox immediately.</p>
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
