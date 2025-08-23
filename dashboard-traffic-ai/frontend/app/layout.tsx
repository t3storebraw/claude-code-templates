import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Traffic AI Dashboard',
	description: 'Local dashboard for paid traffic insights',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR">
			<body>{children}</body>
		</html>
	);
}