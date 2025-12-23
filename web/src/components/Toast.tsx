'use client' // Only needed for Next.js (App Router)

import { Toaster, toast } from 'react-hot-toast'

const ToastExample = () => {
  const showSuccess = () => toast.success('Success! 🚀')
  const showError = () => toast.error('Something went wrong! ❌')
  const showCustom = () => toast('Custom Toast 🎉', { icon: '🔥' })

  return (
    <div className='p-4 space-y-4'>
      <Toaster position='top-right' reverseOrder={false} />
      <button
        className='p-2 bg-green-500 text-white rounded'
        onClick={showSuccess}
      >
        Success
      </button>
      <button className='p-2 bg-red-500 text-white rounded' onClick={showError}>
        Error
      </button>
      <button
        className='p-2 bg-blue-500 text-white rounded'
        onClick={showCustom}
      >
        Custom
      </button>
    </div>
  )
}

export default ToastExample
