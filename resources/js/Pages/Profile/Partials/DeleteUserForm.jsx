import React, { useRef, useState } from 'react';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Lock, Trash2, ShieldAlert } from 'lucide-react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-5 ${className}`}>
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/60 p-4 sm:p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                    <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-rose-950">Permanent Account Removal</h4>
                    <p className="mt-1 text-xs text-rose-800/80 leading-relaxed">
                        Deleting your account will erase your profile information, saved addresses, reward balances, and access to order records. This action cannot be undone.
                    </p>
                </div>
            </div>

            <div>
                <button
                    type="button"
                    onClick={confirmUserDeletion}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-rose-700 transition focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Account
                </button>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 text-rose-600 mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Confirm Account Deletion
                            </h2>
                            <p className="text-xs text-slate-500">
                                This action is permanent and immediate.
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                        Are you sure you want to permanently delete your account? All of your saved orders, reward points, and profile data will be permanently wiped. Please enter your password below to confirm.
                    </p>

                    <div className="mt-5">
                        <label htmlFor="delete-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Account Password
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <Lock className="h-4 w-4" />
                            </div>
                            <input
                                id="delete-password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                                isFocused
                                placeholder="Enter your password to confirm"
                            />
                        </div>

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal} className="!rounded-xl text-xs font-bold">
                            Cancel
                        </SecondaryButton>

                        <DangerButton disabled={processing} className="!rounded-xl text-xs font-bold uppercase tracking-wider">
                            {processing ? 'Deleting...' : 'Yes, Delete My Account'}
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
