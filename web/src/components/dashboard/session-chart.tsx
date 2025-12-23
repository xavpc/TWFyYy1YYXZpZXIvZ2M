'use client'

import { TrendingUp } from 'lucide-react'
import { LabelList, Pie, PieChart } from 'recharts'
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
  { browser: 'active', visitors: 20, fill: 'var(--color-active)' },
  { browser: 'archived', visitors: 10, fill: 'var(--color-archived)' },
]

const chartConfig = {
  active: {
    label: 'Active',
    color: 'hsl(var(--chart-1))',
  },
  archived: {
    label: 'Archived',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function SessionChart() {
  const dashboard = useTranslations('Dashboard')

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>{dashboard('Session Chart')}</CardTitle>
        <CardDescription>{dashboard('Year of 2025')}</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background'
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey='visitors' hideLabel />}
            />
            <Pie data={chartData} dataKey='visitors'>
              <LabelList
                dataKey='browser'
                className='fill-background'
                stroke='none'
                fontSize={12}
                formatter={(value: keyof typeof chartConfig) =>
                  chartConfig[value]?.label
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col flex text-sm'>
        <div className='flex justify-between w-full'>
          <p>
            {dashboard('Active Session')} -{' '}
            <span className='font-bold'>20</span>
          </p>
        </div>
        <div className='flex justify-between w-full'>
          <p>
            {dashboard('Archived Session')} -{' '}
            <span className='font-bold'>10</span>
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
