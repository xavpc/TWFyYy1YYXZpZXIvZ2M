'use client'

import * as React from 'react'
import { TrendingUp } from 'lucide-react'
import { Label, Pie, PieChart } from 'recharts'
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

export function EmployeeChart() {
  const dashboard = useTranslations('Dashboard')

  const chartData = [
    {
      browser: dashboard('Employees'),
      visitors: 21,
      fill: 'var(--color-employee)',
    },
    {
      browser: dashboard('Devices'),
      visitors: 35,
      fill: 'var(--color-devices)',
    },
    { browser: dashboard('Route'), visitors: 20, fill: 'var(--color-route)' },
    {
      browser: dashboard('Complaints'),
      visitors: 15,
      fill: 'var(--color-complaints)',
    },
    { browser: dashboard('Others'), visitors: 10, fill: 'var(--color-other)' },
  ]

  const chartConfig = {
    employee: {
      label: dashboard('Employees'),
      color: 'hsl(var(--chart-1))',
    },
    devices: {
      label: dashboard('Devices'),
      color: 'hsl(var(--chart-2))',
    },
    route: {
      label: dashboard('Route'),
      color: 'hsl(var(--chart-3))',
    },
    complaints: {
      label: dashboard('Complaints'),
      color: 'hsl(var(--chart-4))',
    },
    other: {
      label: dashboard('Others'),
      color: 'hsl(var(--chart-5))',
    },
  } satisfies ChartConfig
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [])

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>{dashboard('Chart')}</CardTitle>
        <CardDescription>{dashboard('Year of 2025')}</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='visitors'
              nameKey='browser'
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          {dashboard('Total')}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none'>
          <p className='text-xs text-center'>{dashboard('Showing')}</p>
        </div>
      </CardFooter>
    </Card>
  )
}
