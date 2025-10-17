import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Lock,
  Save,
  AlertCircle,
  Loader2,
  Briefcase,
  Activity,
  Clock,
  FileText,
  Shield,
  Settings,
  Edit2,
  X,
  Check,
} from 'lucide-react';
import { useNavigate } from '../navigation';
import Navigation from '../../components/Navigation';
import {
  getProfile,
  updateProfile,
  updatePassword,
  type ProfileData,
  type UpdateProfileData,
} from '../../services/profileService';

export default function ProfileManagementPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'personal' | 'address' | 'emergency' | 'insurance' | 'security' | 'roleData'
  >('personal');

  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<UpdateProfileData>({});
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Fetch profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProfile();

      if (response.success && response.data) {
        setProfile(response.data);
        initializeEditData(response.data);
      } else {
        setError('Failed to load profile data');
      }
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'An error occurred while loading your profile');
    } finally {
      setLoading(false);
    }
  };

  const initializeEditData = (profileData: ProfileData) => {
    setEditData({
      name: profileData.name,
      phone: profileData.phone || '',
      dateOfBirth: profileData.dateOfBirth
        ? new Date(profileData.dateOfBirth).toISOString().split('T')[0]
        : '',
      gender: profileData.gender || '',
      bloodType: profileData.bloodType || '',
      address: profileData.address || '',
      emergencyContact: {
        name: profileData.emergencyContact?.name || '',
        relationship: profileData.emergencyContact?.relationship || '',
        phone: profileData.emergencyContact?.phone || '',
      },
      insurance: {
        provider: profileData.insurance?.provider || '',
        policyNumber: profileData.insurance?.policyNumber || '',
        groupNumber: profileData.insurance?.groupNumber || '',
      },
      specialization: profileData.specialization || '',
      department: profileData.department || '',
    });
  };

  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      // Cancel editing - reset to original data
      if (profile) {
        initializeEditData(profile);
      }
    }
    setIsEditing(!isEditing);
    setSaveMessage(null);
  }, [isEditing, profile]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleNestedInputChange = useCallback((parent: string, field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof UpdateProfileData] as any),
        [field]: value,
      },
    }));
  }, []);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      const response = await updateProfile(editData);

      if (response.success) {
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
        setProfile(response.data);
        setIsEditing(false);
        
        // Reload profile data after 1 second
        setTimeout(() => {
          fetchUserProfile();
        }, 1000);
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      setSaveMessage({ type: 'error', text: err.message || 'An error occurred while updating profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setIsSaving(true);
      const response = await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        setPasswordSuccess(true);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        
        // Show success message for 2 seconds then reload
        setTimeout(() => {
          setPasswordSuccess(false);
          fetchUserProfile();
        }, 2000);
      } else {
        setPasswordError('Failed to update password');
      }
    } catch (err: any) {
      console.error('Password update error:', err);
      setPasswordError(err.message || 'An error occurred while updating password');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navigation currentPage="profile" isAuthenticated={true} userName="User" />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start space-x-4">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-red-800 font-semibold text-lg mb-2">Error Loading Profile</h3>
              <p className="text-red-700">{error || 'Unable to load profile data'}</p>
              <button
                onClick={fetchUserProfile}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Define tabs based on user role
  const getTabsForRole = () => {
    const baseTabs = [
      { id: 'personal' as const, label: 'Personal Info', icon: User },
      { id: 'address' as const, label: 'Address', icon: MapPin },
    ];

    // Add role-specific tab
    baseTabs.push({ id: 'roleData' as const, label: `${profile.userRole} Details`, icon: Briefcase });

    // Add conditional tabs based on role
    if (profile.userRole === 'Patient') {
      baseTabs.push({ id: 'emergency' as const, label: 'Emergency Contact', icon: Users });
      baseTabs.push({ id: 'insurance' as const, label: 'Insurance', icon: CreditCard });
    }

    baseTabs.push({ id: 'security' as const, label: 'Security', icon: Lock });

    return baseTabs;
  };

  const tabs = getTabsForRole();

  // Render tab content - Using variables instead of JSX to avoid remounting
  const renderTabContent = () => {
    if (activeTab === 'personal') {
      return (
        <PersonalInfoTab
          profile={profile!}
          isEditing={isEditing}
          isSaving={isSaving}
          editData={editData}
          handleEditToggle={handleEditToggle}
          handleSaveProfile={handleSaveProfile}
          handleInputChange={handleInputChange}
        />
      );
    }
    if (activeTab === 'address') {
      return (
        <AddressTab
          profile={profile!}
          isEditing={isEditing}
          isSaving={isSaving}
          editData={editData}
          handleEditToggle={handleEditToggle}
          handleSaveProfile={handleSaveProfile}
          handleInputChange={handleInputChange}
        />
      );
    }
    if (activeTab === 'emergency') {
      return (
        <EmergencyContactTab
          profile={profile!}
          isEditing={isEditing}
          isSaving={isSaving}
          editData={editData}
          handleEditToggle={handleEditToggle}
          handleSaveProfile={handleSaveProfile}
          handleNestedInputChange={handleNestedInputChange}
        />
      );
    }
    if (activeTab === 'insurance') {
      return (
        <InsuranceTab
          profile={profile!}
          isEditing={isEditing}
          isSaving={isSaving}
          editData={editData}
          handleEditToggle={handleEditToggle}
          handleSaveProfile={handleSaveProfile}
          handleNestedInputChange={handleNestedInputChange}
        />
      );
    }
    if (activeTab === 'security') {
      return (
        <SecurityTab
          passwordData={passwordData}
          setPasswordData={setPasswordData}
          passwordError={passwordError}
          passwordSuccess={passwordSuccess}
          isSaving={isSaving}
          handlePasswordChange={handlePasswordChange}
        />
      );
    }
    if (activeTab === 'roleData') {
      return <RoleDataTab profile={profile!} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentPage="profile" isAuthenticated={true} userName={profile.name} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-20 lg:ml-[280px]">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Management</h1>
          <p className="text-gray-600">
            Manage your profile as <span className="font-semibold text-blue-600">{profile.userRole}</span>
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="max-w-5xl mx-auto mb-6">
            <div
              className={`rounded-lg p-4 flex items-center space-x-3 ${
                saveMessage.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {saveMessage.type === 'success' ? (
                <Check className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="font-medium">{saveMessage.text}</p>
            </div>
          </div>
        )}

        {/* Role Badge */}
        <div className="max-w-5xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6" />
                <div>
                  <p className="text-sm opacity-90">Current Role</p>
                  <p className="text-xl font-bold">{profile.userRole}</p>
                </div>
              </div>
              {profile.digitalHealthCardId && (
                <div className="text-right">
                  <p className="text-sm opacity-90">Health Card ID</p>
                  <p className="font-mono font-semibold">{profile.digitalHealthCardId}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-5xl mx-auto">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsEditing(false);
                      setSaveMessage(null);
                    }}
                    className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}

// Personal Info Tab Component - MOVED OUTSIDE to prevent remounting
const PersonalInfoTab = React.memo(({
  profile,
  isEditing,
  isSaving,
  editData,
  handleEditToggle,
  handleSaveProfile,
  handleInputChange,
}: {
  profile: ProfileData;
  isEditing: boolean;
  isSaving: boolean;
  editData: UpdateProfileData;
  handleEditToggle: () => void;
  handleSaveProfile: () => void;
  handleInputChange: (field: string, value: any) => void;
}) => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
          {!isEditing ? (
            <button
              onClick={handleEditToggle}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Save</span>
              </button>
              <button
                onClick={handleEditToggle}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="grid md:grid-cols-2 gap-6">
            <EditableField
              label="Full Name"
              value={editData.name || ''}
              onChange={(value) => handleInputChange('name', value)}
              icon={User}
            />
            <InfoField icon={Mail} label="Email" value={profile!.email} readonly />
            <EditableField
              label="Phone"
              value={editData.phone || ''}
              onChange={(value) => handleInputChange('phone', value)}
              icon={Phone}
            />
            <EditableField
              label="Date of Birth"
              value={editData.dateOfBirth || ''}
              onChange={(value) => handleInputChange('dateOfBirth', value)}
              type="date"
              icon={Calendar}
            />
            <EditableSelectField
              label="Gender"
              value={editData.gender || ''}
              onChange={(value) => handleInputChange('gender', value)}
              options={[
                { value: '', label: 'Select...' },
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            {profile!.userRole === 'Patient' && (
              <EditableSelectField
                label="Blood Type"
                value={editData.bloodType || ''}
                onChange={(value) => handleInputChange('bloodType', value)}
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                ]}
              />
            )}
            {profile!.userRole === 'Staff' && (
              <>
                <EditableField
                  label="Specialization"
                  value={editData.specialization || ''}
                  onChange={(value) => handleInputChange('specialization', value)}
                />
                <EditableField
                  label="Department"
                  value={editData.department || ''}
                  onChange={(value) => handleInputChange('department', value)}
                />
              </>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <InfoField icon={User} label="Full Name" value={profile!.name} />
            <InfoField icon={Mail} label="Email" value={profile!.email} />
            <InfoField icon={Phone} label="Phone" value={profile!.phone || 'Not provided'} />
            <InfoField
              icon={Calendar}
              label="Date of Birth"
              value={profile!.dateOfBirth ? new Date(profile!.dateOfBirth).toLocaleDateString() : 'Not provided'}
            />
            <InfoField label="Gender" value={profile!.gender || 'Not specified'} />
            <InfoField label="Account Status" value={profile!.isActive ? 'Active' : 'Inactive'} />
            {profile!.userRole === 'Patient' && profile!.bloodType && (
              <InfoField label="Blood Type" value={profile!.bloodType} />
            )}
            {profile.userRole === 'Staff' && (
              <>
                {profile.specialization && <InfoField label="Specialization" value={profile.specialization} />}
                {profile.department && <InfoField label="Department" value={profile.department} />}
              </>
            )}
          </div>
        )}
      </div>
    );
});

// Address Tab Component - MOVED OUTSIDE
const AddressTab = React.memo(({
  profile,
  isEditing,
  isSaving,
  editData,
  handleEditToggle,
  handleSaveProfile,
  handleInputChange,
}: {
  profile: ProfileData;
  isEditing: boolean;
  isSaving: boolean;
  editData: UpdateProfileData;
  handleEditToggle: () => void;
  handleSaveProfile: () => void;
  handleInputChange: (field: string, value: any) => void;
}) => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Address Information</h2>
          {!isEditing ? (
            <button
              onClick={handleEditToggle}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Save</span>
              </button>
              <button
                onClick={handleEditToggle}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={editData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your complete address"
              />
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6">
            <MapPin className="h-6 w-6 text-blue-600 mb-3" />
            <p className="text-gray-700 text-lg">{profile.address || 'Address not provided'}</p>
          </div>
        )}
      </div>
    );
});

// Emergency Contact Tab - MOVED OUTSIDE
const EmergencyContactTab = React.memo(({
  profile,
  isEditing,
  isSaving,
  editData,
  handleEditToggle,
  handleSaveProfile,
  handleNestedInputChange,
}: {
  profile: ProfileData;
  isEditing: boolean;
  isSaving: boolean;
  editData: UpdateProfileData;
  handleEditToggle: () => void;
  handleSaveProfile: () => void;
  handleNestedInputChange: (parent: string, field: string, value: string) => void;
}) => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Emergency Contact</h2>
          {!isEditing ? (
            <button
              onClick={handleEditToggle}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Save</span>
              </button>
              <button
                onClick={handleEditToggle}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="grid md:grid-cols-3 gap-6">
            <EditableField
              label="Contact Name"
              value={editData.emergencyContact?.name || ''}
              onChange={(value) => handleNestedInputChange('emergencyContact', 'name', value)}
              icon={Users}
            />
            <EditableField
              label="Relationship"
              value={editData.emergencyContact?.relationship || ''}
              onChange={(value) => handleNestedInputChange('emergencyContact', 'relationship', value)}
            />
            <EditableField
              label="Phone"
              value={editData.emergencyContact?.phone || ''}
              onChange={(value) => handleNestedInputChange('emergencyContact', 'phone', value)}
              icon={Phone}
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <InfoField icon={Users} label="Contact Name" value={profile!.emergencyContact?.name || 'Not provided'} />
            <InfoField label="Relationship" value={profile!.emergencyContact?.relationship || 'Not provided'} />
            <InfoField icon={Phone} label="Phone" value={profile.emergencyContact?.phone || 'Not provided'} />
          </div>
        )}
      </div>
    );
});

// Insurance Tab - MOVED OUTSIDE
const InsuranceTab = React.memo(({
  profile,
  isEditing,
  isSaving,
  editData,
  handleEditToggle,
  handleSaveProfile,
  handleNestedInputChange,
}: {
  profile: ProfileData;
  isEditing: boolean;
  isSaving: boolean;
  editData: UpdateProfileData;
  handleEditToggle: () => void;
  handleSaveProfile: () => void;
  handleNestedInputChange: (parent: string, field: string, value: string) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Insurance Information</h2>
        {!isEditing ? (
          <button
            onClick={handleEditToggle}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>Save</span>
            </button>
            <button
              onClick={handleEditToggle}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="grid md:grid-cols-3 gap-6">
          <EditableField
            label="Provider"
            value={editData.insurance?.provider || ''}
            onChange={(value) => handleNestedInputChange('insurance', 'provider', value)}
            icon={CreditCard}
          />
          <EditableField
            label="Policy Number"
            value={editData.insurance?.policyNumber || ''}
            onChange={(value) => handleNestedInputChange('insurance', 'policyNumber', value)}
          />
          <EditableField
            label="Group Number"
            value={editData.insurance?.groupNumber || ''}
            onChange={(value) => handleNestedInputChange('insurance', 'groupNumber', value)}
          />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <InfoField icon={CreditCard} label="Provider" value={profile.insurance?.provider || 'Not provided'} />
          <InfoField label="Policy Number" value={profile.insurance?.policyNumber || 'Not provided'} />
          <InfoField label="Group Number" value={profile.insurance?.groupNumber || 'Not provided'} />
        </div>
      )}
    </div>
  );
});

// Security Tab - MOVED OUTSIDE
const SecurityTab = React.memo(({
  passwordData,
  setPasswordData,
  passwordSuccess,
  passwordError,
  isSaving,
  handlePasswordChange,
}: {
  passwordData: PasswordUpdateData;
  setPasswordData: (data: PasswordUpdateData) => void;
  passwordSuccess: boolean;
  passwordError: string;
  isSaving: boolean;
  handlePasswordChange: (e: React.FormEvent) => void;
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Security Settings</h2>

      {passwordSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 mb-6">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium">Password updated successfully!</p>
        </div>
      )}

      {passwordError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 mb-6">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{passwordError}</p>
        </div>
      )}

      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter new password (min. 6 characters)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm new password"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              <span>Update Password</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
});

// Role-Specific Data Tab - Uses switch statement for clean role-based rendering
function RoleDataTab({ profile }: { profile: ProfileData }) {
  const { userRole, roleData } = profile;

  // Object mapping for role-specific renderers
  const roleRenderers: Record<string, () => JSX.Element> = {
    Patient: () => <PatientRoleData roleData={roleData} />,
    Doctor: () => <DoctorRoleData roleData={roleData} />,
    Staff: () => <StaffRoleData roleData={roleData} />,
    Admin: () => <AdminRoleData roleData={roleData} />,
    Pharmacist: () => <PharmacistRoleData roleData={roleData} />,
    Nurse: () => <NurseRoleData roleData={roleData} />,
    'Hospital Administrator': () => <AdminRoleData roleData={roleData} />,
  };

  const renderer = roleRenderers[userRole];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{userRole}-Specific Information</h2>
      {renderer ? renderer() : <p className="text-gray-600">No role-specific data available</p>}
    </div>
  );
}

// Patient Role Data Component
function PatientRoleData({ roleData }: { roleData: any }) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          icon={Activity}
          label="Blood Group"
          value={roleData.bloodGroup || 'Not specified'}
          color="red"
        />
        <StatCard
          icon={Calendar}
          label="Last Visit"
          value={roleData.lastVisitDate ? new Date(roleData.lastVisitDate).toLocaleDateString() : 'No visits'}
          color="blue"
        />
        <StatCard
          icon={Clock}
          label="Upcoming Appointments"
          value={roleData.upcomingAppointmentsCount?.toString() || '0'}
          color="green"
        />
      </div>

      {/* Recent Appointments */}
      {roleData.recentAppointments && roleData.recentAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Appointments</h3>
          <div className="space-y-3">
            {roleData.recentAppointments.map((apt: any, idx: number) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">{apt.doctorName}</p>
                  <p className="text-sm text-gray-600">{apt.specialization}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{new Date(apt.date).toLocaleDateString()}</p>
                  <p className="text-sm font-medium text-blue-600">{apt.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Doctor Role Data Component
function DoctorRoleData({ roleData }: { roleData: any }) {
  return (
    <div className="space-y-6">
      {/* Professional Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <InfoField icon={Briefcase} label="Specialization" value={roleData.specialization || 'N/A'} />
        <InfoField label="License Number" value={roleData.licenseNumber || 'N/A'} />
        <InfoField label="Department" value={roleData.department || 'N/A'} />
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          icon={Clock}
          label="Today's Appointments"
          value={roleData.todayAppointmentsCount?.toString() || '0'}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total Patients Served"
          value={roleData.totalPatientsServed?.toString() || '0'}
          color="green"
        />
        <StatCard
          icon={Activity}
          label="Upcoming Appointments"
          value={roleData.upcomingAppointments?.length.toString() || '0'}
          color="purple"
        />
      </div>

      {/* Upcoming Appointments */}
      {roleData.upcomingAppointments && roleData.upcomingAppointments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Appointments</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {roleData.upcomingAppointments.map((apt: any, idx: number) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">{apt.patientName}</p>
                  <p className="text-sm text-gray-600">{apt.patientPhone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {new Date(apt.date).toLocaleDateString()} at {apt.time}
                  </p>
                  <p className="text-sm font-medium text-blue-600">{apt.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Staff Role Data Component
function StaffRoleData({ roleData }: { roleData: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <InfoField label="Department" value={roleData.department || 'N/A'} />
        <InfoField label="Internal ID" value={roleData.internalId || 'N/A'} />
      </div>

      {/* Permissions */}
      {roleData.permissions && roleData.permissions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">System Permissions</h3>
          <div className="flex flex-wrap gap-2">
            {roleData.permissions.map((perm: string, idx: number) => (
              <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* System Tools */}
      {roleData.systemTools && roleData.systemTools.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Access Tools</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {roleData.systemTools.map((tool: any, idx: number) => (
              <a
                key={idx}
                href={tool.url}
                className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <Settings className="h-5 w-5 text-blue-600 mb-2" />
                <p className="font-semibold text-gray-900">{tool.name}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Admin Role Data Component
function AdminRoleData({ roleData }: { roleData: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <InfoField label="Department" value={roleData.department || 'N/A'} />
        <InfoField label="Admin Level" value={roleData.adminLevel || 'N/A'} />
      </div>

      {/* System Stats */}
      {roleData.systemStats && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">System Statistics</h3>
          <div className="grid md:grid-cols-5 gap-4">
            <StatCard icon={Users} label="Total Users" value={roleData.systemStats.totalUsers?.toString() || '0'} color="blue" />
            <StatCard label="Patients" value={roleData.systemStats.totalPatients?.toString() || '0'} color="green" />
            <StatCard label="Doctors" value={roleData.systemStats.totalDoctors?.toString() || '0'} color="purple" />
            <StatCard label="Staff" value={roleData.systemStats.totalStaff?.toString() || '0'} color="yellow" />
            <StatCard label="Today's Appointments" value={roleData.systemStats.todayAppointments?.toString() || '0'} color="red" />
          </div>
        </div>
      )}

      {/* Admin Tools */}
      {roleData.adminTools && roleData.adminTools.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Administrative Tools</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {roleData.adminTools.map((tool: any, idx: number) => (
              <a
                key={idx}
                href={tool.url}
                className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <Shield className="h-5 w-5 text-purple-600 mb-2" />
                <p className="font-semibold text-gray-900">{tool.name}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Permissions */}
      {roleData.permissions && roleData.permissions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Permissions</h3>
          <div className="flex flex-wrap gap-2">
            {roleData.permissions.map((perm: string, idx: number) => (
              <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Pharmacist Role Data Component
function PharmacistRoleData({ roleData }: { roleData: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <InfoField label="Department" value={roleData.department || 'N/A'} />
        <InfoField label="License Number" value={roleData.licenseNumber || 'N/A'} />
        <InfoField label="Specialization" value={roleData.specialization || 'N/A'} />
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <StatCard
          icon={FileText}
          label="Pending Prescriptions"
          value={roleData.pendingPrescriptionsCount?.toString() || '0'}
          color="yellow"
        />
        <StatCard
          icon={Activity}
          label="Dispensed by You"
          value={roleData.dispensedCount?.toString() || '0'}
          color="green"
        />
      </div>

      {/* System Tools */}
      {roleData.systemTools && roleData.systemTools.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Pharmacy Tools</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {roleData.systemTools.map((tool: any, idx: number) => (
              <a
                key={idx}
                href={tool.url}
                className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <Settings className="h-5 w-5 text-green-600 mb-2" />
                <p className="font-semibold text-gray-900">{tool.name}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Nurse Role Data Component
function NurseRoleData({ roleData }: { roleData: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <InfoField label="Department" value={roleData.department || 'N/A'} />
        <InfoField label="Specialization" value={roleData.specialization || 'N/A'} />
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <StatCard
          icon={Activity}
          label="Triage Records Created"
          value={roleData.triageRecordsCount?.toString() || '0'}
          color="blue"
        />
        <StatCard
          icon={AlertCircle}
          label="Critical Patients Today"
          value={roleData.criticalPatientsToday?.toString() || '0'}
          color="red"
        />
      </div>

      {/* System Tools */}
      {roleData.systemTools && roleData.systemTools.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Nursing Tools</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {roleData.systemTools.map((tool: any, idx: number) => (
              <a
                key={idx}
                href={tool.url}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <Settings className="h-5 w-5 text-blue-600 mb-2" />
                <p className="font-semibold text-gray-900">{tool.name}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable UI Components
function InfoField({
  icon: Icon,
  label,
  value,
  readonly = false,
}: {
  icon?: any;
  label: string;
  value: string | number;
  readonly?: boolean;
}) {
  return (
    <div className={`${readonly ? 'bg-gray-100' : 'bg-gray-50'} rounded-lg p-4`}>
      <div className="flex items-center space-x-2 mb-2">
        {Icon && <Icon className="h-4 w-4 text-gray-600" />}
        <p className="text-sm font-medium text-gray-600">{label}</p>
      </div>
      <p className="text-gray-900 font-semibold">{value}</p>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  type = 'text',
  icon: Icon,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: any;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {Icon && <Icon className="inline h-4 w-4 mr-1" />}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
  );
}

function EditableSelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = 'blue',
}: {
  icon?: any;
  label: string;
  value: string;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4`}>
      {Icon && <Icon className={`h-6 w-6 mb-2`} />}
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
    </div>
  );
}

