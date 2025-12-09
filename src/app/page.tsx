import Employee from '@/components/employees/Employee'
import { ModeButton } from '@/components/ModeButton'

export default function Home() {
  return (
    <>
      <div className='p-10'>
        <ModeButton />
        <Employee />
      </div>
    </>
  )
}
