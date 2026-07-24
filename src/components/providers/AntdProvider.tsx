'use client'

import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useTheme } from './ThemeProvider'

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { theme: currentTheme } = useTheme()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
