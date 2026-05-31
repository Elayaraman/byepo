import { useState, useEffect } from 'react';

export default function App() {
    const [orgName, setOrgName] = useState(window.location.pathname.split('/')[1] || '');
    const [inputOrgName, setInputOrgName] = useState('');

    const [flagKey, setFlagKey] = useState('');
    const [status, setStatus] = useState('loading'); // waiting_for_org, loading, valid, invalid
    const [checkResult, setCheckResult] = useState(null);

    useEffect(() => {
        if (!orgName) {
            setStatus('waiting_for_org');
            return;
        }

        setStatus('loading');
        fetch(`http://localhost:3000/_api/org/public/${orgName}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setStatus('valid');
                } else {
                    setStatus('invalid');
                }
            })
            .catch(() => setStatus('invalid'));
    }, [orgName]);

    const handleOrgSubmit = (e) => {
        e.preventDefault();
        if (inputOrgName.trim()) {
            const newOrgName = inputOrgName.trim();
            window.history.pushState(null, '', '/' + newOrgName);
            setOrgName(newOrgName);
        }
    };

    const handleCheck = async (e) => {
        e.preventDefault();
        setCheckResult(null);
        try {
            const res = await fetch(`http://localhost:3000/_api/flag/check?org_name=${orgName}&name=${flagKey}`);
            const data = await res.json();
            if (data.success) {
                setCheckResult(data.enabled ? 'Enabled' : 'Disabled');
            } else {
                setCheckResult('Error checking flag');
            }
        } catch (error) {
            setCheckResult('Error connecting to server');
        }
    };

    return (
        <div className='flex min-h-screen justify-center items-center'>
            {status === 'waiting_for_org' && (
                <div className="p-8 font-sans">
                    <h2 className="text-xl font-bold mb-4">Welcome</h2>
                    <p className="mb-4">Enter your organization name to continue.</p>
                    <form onSubmit={handleOrgSubmit} className="space-y-4 max-w-sm">
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300"
                            placeholder="Organization name"
                            value={inputOrgName}
                            onChange={(e) => setInputOrgName(e.target.value)}
                            required
                        />
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 cursor-pointer">
                            Continue
                        </button>
                    </form>
                </div>
            )}

            {status === 'loading' && (
                <div className="p-8">Loading...</div>
            )}

            {status === 'invalid' && (
                <div className="p-8 font-sans">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Invalid Organization</h2>
                    <p className="mb-4">The organization "{orgName}" does not exist or is invalid.</p>
                    <button
                        onClick={() => {
                            window.history.pushState(null, '', '/');
                            setOrgName('');
                        }}
                        className="text-blue-600 underline cursor-pointer"
                    >
                        Try another organization
                    </button>
                </div>
            )}

            {status === 'valid' && (
                <div className="p-8 font-sans">
                    <header className="mb-8 border-b pb-4">
                        <h1 className="text-2xl font-bold">Byepo Check</h1>
                    </header>

                    <main className="max-w-md">
                        <h2 className="text-xl font-bold mb-2">Check Feature Status</h2>
                        <p className="mb-6">Verify the status of a feature toggle for <strong>{orgName}</strong>.</p>

                        <form onSubmit={handleCheck} className="space-y-4">
                            <div>
                                <label htmlFor="flagKey" className="block font-bold mb-1">
                                    Feature Key
                                </label>
                                <input
                                    type="text"
                                    id="flagKey"
                                    className="w-full p-2 border border-gray-300"
                                    placeholder="e.g. new-checkout-flow"
                                    value={flagKey}
                                    onChange={(e) => setFlagKey(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white p-2 cursor-pointer">
                                Check Status
                            </button>

                            {checkResult && (
                                <div className="mt-4 p-4 border border-gray-300 font-bold">
                                    Result: {checkResult}
                                </div>
                            )}
                        </form>
                    </main>
                </div>
            )}
        </div>
    );
}