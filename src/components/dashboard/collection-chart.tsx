'use client'

import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { useTranslations } from 'next-intl' // Import useTranslations

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
const chartData = [
  { month: 'January', collected: 50, complaints: 10 },
  { month: 'February', collected: 40, complaints: 7 },
  { month: 'March', collected: 32, complaints: 9 },
  { month: 'April', collected: 80, complaints: 5 },
  { month: 'May', collected: 76, complaints: 10 },
  { month: 'June', collected: 66, complaints: 12 },
]

const chartConfig = {
  collected: {
    label: 'Collected',
    color: 'hsl(var(--chart-1))',
  },
  complaints: {
    label: 'Complaints',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function ChartBar() {
  const dashboard = useTranslations('Dashboard')
  return (
    <Card>
      <CardHeader>
        <CardTitle>{dashboard('Collection Chart')}</CardTitle>
        <CardDescription>{dashboard('Year of 2025')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='month'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dashed' />}
            />
            <Bar dataKey='collected' fill='var(--color-collected)' radius={4} />
            <Bar
              dataKey='complaints'
              fill='var(--color-complaints)'
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex flex-col w-full items-start text-sm'>
          <div className='flex justify-between w-full'>
            <p>
              {dashboard('Blue')} -{' '}
              <span className='font-bold'> {dashboard('Collected')}</span>
            </p>
            <p>
              {dashboard('Total')} - <span className='font-bold'>344</span>
            </p>
          </div>
          <div className='flex justify-between w-full'>
            <p>
              {dashboard('Green')} -{' '}
              <span className='font-bold'> {dashboard('Complaints')}</span>
            </p>
            <p>
              {dashboard('Blue')} - <span className='font-bold'>53</span>
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
