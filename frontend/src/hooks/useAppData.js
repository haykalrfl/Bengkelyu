import { useContext } from 'react'
import { DataContext } from '../context/DataContext'

export function useAppData() {
  const context = useContext(DataContext)

  if (!context) {
    throw new Error('useAppData harus dipakai di dalam DataProvider.')
  }

  return context
}
