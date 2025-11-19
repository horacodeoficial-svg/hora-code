export const metadata = {
  title: 'HORA CODE',
  description: 'Geração automática de sites por IA'
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        {children}
      </body>
    </html>
  )
}
