import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, UserCheck, Key, Database, RefreshCw, User, CheckCircle, AlertTriangle, Lock, Users } from 'lucide-react';
import { UserRole, UserTier } from '../types';
import { ExtendedUserAccount, updateUserRoleAndStatus, getAllUserAccounts, getUserAccount } from '../lib/dbService';
import firebaseConfig from '../../firebase-applet-config.json';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserUid: string | null;
  currentUserEmail: string | null;
  currentRole: UserRole;
  currentStatus?: 'active' | 'pending' | 'suspended';
  currentTier: UserTier;
  onUpdateRoleAndStatus: (role: UserRole, status: 'active' | 'pending' | 'suspended', tier: UserTier) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUserUid,
  currentUserEmail,
  currentRole,
  currentStatus = 'active',
  currentTier,
  onUpdateRoleAndStatus
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'pending' | 'suspended'>(currentStatus);
  const [selectedTier, setSelectedTier] = useState<UserTier>(currentTier);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin user list state
  const [allUsers, setAllUsers] = useState<ExtendedUserAccount[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [editingUid, setEditingUid] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRole(currentRole);
    setSelectedStatus(currentStatus);
    setSelectedTier(currentTier);
  }, [currentRole, currentStatus, currentTier, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadAllUsers();
    }
  }, [isOpen]);

  const loadAllUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const users = await getAllUserAccounts();
      setAllUsers(users);
    } catch (err) {
      console.error('Failed to load user list:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveSelfRoleStatus = async () => {
    if (!currentUserUid) {
      setErrorMsg('You must be signed in with a valid account to update account status.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const success = await updateUserRoleAndStatus(currentUserUid, selectedRole, selectedStatus, selectedTier);
      if (success) {
        onUpdateRoleAndStatus(selectedRole, selectedStatus, selectedTier);
        setSaveSuccess(true);
        loadAllUsers();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMsg('Failed to update user profile.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while updating status.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateOtherUser = async (uid: string, role: UserRole, status: 'active' | 'pending' | 'suspended', tier: UserTier) => {
    setEditingUid(uid);
    try {
      const success = await updateUserRoleAndStatus(uid, role, status, tier);
      if (success) {
        loadAllUsers();
        if (uid === currentUserUid) {
          onUpdateRoleAndStatus(role, status, tier);
        }
      }
    } catch (err) {
      console.error('Error updating user role:', err);
    } finally {
      setEditingUid(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-[#111116] border border-[#2D2D38] w-full max-w-3xl p-6 rounded-xl relative text-[#F0F0F8] space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#22222E] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">
                Account &amp; Role Management
              </h2>
            </div>
            <p className="text-xs text-[#A0A0B0] font-mono">
              View and edit user access roles, account verification status, and subscription tier.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#777] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Connection Banner */}
        <div className="p-3.5 bg-[#181822] border border-[#2A2A38] rounded-xl flex items-center justify-between text-xs font-mono text-[#A0A0C0]">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-white font-bold">Account Connection: </span>
              <span className="text-amber-300 font-bold">Active &amp; Synced</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>🟢 Persistent Storage Active</span>
          </div>
        </div>

        {/* Current Active User Profile Box */}
        <div className="bg-[#16161E] border border-[#2B2B3A] p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black uppercase text-amber-300 tracking-wider font-mono">
                Your Account Credentials & Status
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#888]">
              UID: {currentUserUid ? `${currentUserUid.substring(0, 12)}...` : 'Demo Session'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1">Authenticated Email</label>
              <div className="bg-[#0D0D12] border border-[#222230] p-2.5 rounded font-mono text-white text-xs truncate">
                {currentUserEmail || 'demo_user@pathway.ai'}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1">Account Role in Backend Auth</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-[#0D0D12] border border-[#3A3A4A] px-3 py-2 text-xs text-emerald-400 font-bold uppercase rounded focus:outline-none focus:border-emerald-500"
              >
                <option value="traveller">1. Traveller / Relocator</option>
                <option value="emergency_contact">2. Parent / Family Guardian</option>
                <option value="admin">3. Mobility Advisor / Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1">Account Verification Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'active' | 'pending' | 'suspended')}
                className="w-full bg-[#0D0D12] border border-[#3A3A4A] px-3 py-2 text-xs text-amber-300 font-bold uppercase rounded focus:outline-none focus:border-amber-500"
              >
                <option value="active">Active Access (Verified)</option>
                <option value="pending">Pending Verification</option>
                <option value="suspended">Suspended / Read-only</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-[#888] mb-1">Subscription Tier</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as UserTier)}
                className="w-full bg-[#0D0D12] border border-[#3A3A4A] px-3 py-2 text-xs text-blue-300 font-bold uppercase rounded focus:outline-none focus:border-blue-500"
              >
                <option value="free">Free Tier</option>
                <option value="pro">Pro Tier ($3/mo)</option>
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-600/50 rounded text-xs text-red-300 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded text-xs text-emerald-300 font-mono flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Account status updated and saved!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveSelfRoleStatus}
              disabled={isSaving}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>SAVE CHANGES</span>
            </button>
          </div>
        </div>

        {/* Admin / Multi-User Directory Table */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white font-mono">
                Registered Users Directory
              </h3>
            </div>
            <button
              onClick={loadAllUsers}
              disabled={isLoadingUsers}
              className="text-xs text-[#888] hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              <span>Refresh Directory</span>
            </button>
          </div>

          <div className="bg-[#12121A] border border-[#222230] rounded-xl overflow-hidden text-xs">
            {allUsers.length === 0 ? (
              <div className="p-6 text-center text-[#777] font-mono">
                {isLoadingUsers ? 'Loading registered users...' : 'No other users registered yet. Sign in or register new accounts to see them here.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1A1A26] border-b border-[#28283A] text-[10px] uppercase font-mono text-[#888]">
                      <th className="p-3">User Email / Display</th>
                      <th className="p-3">UID</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Tier</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F2C]">
                    {allUsers.map((u) => {
                      const isSelf = u.uid === currentUserUid;
                      return (
                        <tr key={u.uid} className={`hover:bg-[#181824] transition-colors ${isSelf ? 'bg-emerald-950/10' : ''}`}>
                          <td className="p-3 font-mono">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.displayName || u.email}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#777]">{u.email}</div>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-[#777]">
                            {u.uid ? `${u.uid.substring(0, 8)}...` : 'N/A'}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              u.role === 'admin' 
                                ? 'bg-purple-900/50 text-purple-300 border border-purple-600/40' 
                                : u.role === 'emergency_contact'
                                ? 'bg-amber-900/50 text-amber-300 border border-amber-600/40'
                                : 'bg-emerald-900/50 text-emerald-300 border border-emerald-600/40'
                            }`}>
                              {u.role || 'traveller'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              u.status === 'suspended'
                                ? 'bg-red-950/60 text-red-400 border border-red-700/40'
                                : u.status === 'pending'
                                ? 'bg-yellow-950/60 text-yellow-400 border border-yellow-700/40'
                                : 'bg-green-950/60 text-green-400 border border-green-700/40'
                            }`}>
                              {u.status || 'active'}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-[#AAA]">
                            {(u.subscriptionTier || 'free').toUpperCase()}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <select
                                value={u.role || 'traveller'}
                                onChange={(e) => handleUpdateOtherUser(u.uid, e.target.value as UserRole, u.status || 'active', u.subscriptionTier || 'free')}
                                disabled={editingUid === u.uid}
                                className="bg-[#0A0A0F] border border-[#333] text-[10px] text-white rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                              >
                                <option value="traveller">Traveller</option>
                                <option value="emergency_contact">Guardian</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#22222E] flex items-center justify-between text-xs text-[#777]">
          <span className="font-mono text-[11px]">Changes take effect immediately across workspace and API sessions.</span>
          <button
            onClick={onClose}
            className="bg-[#222230] hover:bg-[#333348] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
