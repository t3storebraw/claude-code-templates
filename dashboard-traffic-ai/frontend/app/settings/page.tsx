"use client";

import { useEffect, useState } from 'react';

export default function SettingsPage() {
	const [form, setForm] = useState({ instagram: '', facebook: '', meta: '', tiktok: '' });
	const [status, setStatus] = useState<string>('');

	useEffect(() => {
		fetch('http://localhost:3001/apiKeys')
			.then(r => r.json())
			.then(setForm)
			.catch(() => {});
	}, []);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus('Salvando...');
		try {
			const res = await fetch('http://localhost:3001/apiKeys/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form),
			});
			const json = await res.json();
			setStatus(json.success ? 'Salvo!' : 'Erro ao salvar');
		} catch (e) {
			setStatus('Erro ao salvar');
		}
	};

	return (
		<div className="min-h-screen p-6">
			<h1 className="text-2xl font-semibold mb-6">Configurações de API</h1>
			<form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
				<label className="flex flex-col gap-2">
					<span>Instagram Token</span>
					<input value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} className="bg-purple-900/30 border border-purple-800/40 rounded px-3 py-2" />
				</label>
				<label className="flex flex-col gap-2">
					<span>Facebook Token</span>
					<input value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} className="bg-purple-900/30 border border-purple-800/40 rounded px-3 py-2" />
				</label>
				<label className="flex flex-col gap-2">
					<span>Meta Ads Token</span>
					<input value={form.meta} onChange={e => setForm({ ...form, meta: e.target.value })} className="bg-purple-900/30 border border-purple-800/40 rounded px-3 py-2" />
				</label>
				<label className="flex flex-col gap-2">
					<span>TikTok Token</span>
					<input value={form.tiktok} onChange={e => setForm({ ...form, tiktok: e.target.value })} className="bg-purple-900/30 border border-purple-800/40 rounded px-3 py-2" />
				</label>
				<div className="col-span-full flex items-center gap-4 mt-2">
					<button className="bg-purple-600 hover:bg-purple-500 transition text-white rounded px-4 py-2" type="submit">Salvar</button>
					<span className="text-sm text-purple-200">{status}</span>
				</div>
			</form>
		</div>
	);
}