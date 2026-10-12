export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen overflow-hidden bg-[#08111f] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.20),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.20),_transparent_28%),linear-gradient(135deg,_#08111f_0%,_#0f172a_48%,_#111827_100%)]" />
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:42px_42px]" />

            <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
                <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.94] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}