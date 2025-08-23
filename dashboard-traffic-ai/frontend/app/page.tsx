"use client";

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
} from 'chart.js';
import { Activity, Instagram, Facebook, LineChart, Cog, CircleDollarSign } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

type Metrics = {
	followers: number;
	impressions: number;
	engagementRate: number;
	roi: number;
	cpa: number;
	trend: { labels: string[]; clicks: number[]; conversions: number[]; spend: number[] };
};

function MetricCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
	return (
		<div className="bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 drop-shadow rounded-xl p-5 flex flex-col justify-center items-center text-white">
			<div className="mb-2">{icon}</div>
			<div className="text-lg">{title}</div>
			<div className="text-2xl font-bold mt-2">{value}</div>
		</div>
	);
}

export default function Page() {
	const [data, setData] = useState<Metrics | null>(null);

	useEffect(() => {
		fetch('http://localhost:3001/api/metrics')
			.then(r => r.json())
			.then(setData)
			.catch(() => setData(null));
	}, []);

	return (
		<div className="min-h-screen flex">
			<aside className="w-20 bg-purple-950/60 border-r border-purple-800/40 flex flex-col items-center py-6 gap-6">
				<div className="text-white text-xs">AI</div>
				<Instagram className="text-purple-300" />
				<Facebook className="text-purple-300" />
				<Activity className="text-purple-300" />
				<CircleDollarSign className="text-purple-300" />
				<Cog className="text-purple-300" />
			</aside>
			<main className="flex-1 p-6 space-y-6">
				<h1 className="text-2xl font-semibold">Dashboard</h1>
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
					<MetricCard title="Seguidores" value={data?.followers ?? '—'} icon={<Instagram />} />
					<MetricCard title="Impressões" value={data?.impressions ?? '—'} icon={<Activity />} />
					<MetricCard title="Engajamento" value={`${data?.engagementRate ?? '—'}%`} icon={<LineChart />} />
					<MetricCard title="ROI" value={`${data?.roi ?? '—'}x`} icon={<CircleDollarSign />} />
					<MetricCard title="CPA" value={`$${data?.cpa ?? '—'}`} icon={<CircleDollarSign />} />
				</div>
				<div className="bg-purple-900/30 border border-purple-800/40 rounded-xl p-4">
					<h2 className="mb-2">Tendência</h2>
					{data ? (
						<Bar
							data={{
								labels: data.trend.labels,
								datasets: [
									{ label: 'Cliques', data: data.trend.clicks, backgroundColor: '#8b5cf6' },
									{ label: 'Conversões', data: data.trend.conversions, backgroundColor: '#22c55e' },
								],
							}}
							options={{ responsive: true, plugins: { legend: { labels: { color: '#fff' } } }, scales: { x: { ticks: { color: '#ddd' } }, y: { ticks: { color: '#ddd' } } } }}
						/>
					) : (
						<div className="text-sm text-purple-200">Carregando...</div>
					)}
				</div>
			</main>
		</div>
	);
}