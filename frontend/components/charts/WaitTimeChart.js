import styled from 'styled-components'
import { Box, Fade, Typography } from '@material-ui/core'
import dynamic from 'next/dynamic'
import { dissoc } from 'ramda'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const Wrap = styled(Box)`
  background-color: #E1F8FF;
  height: 301px;
  position: relative;
`

const Title = styled(Typography)`
  text-align: center;
  padding-top: 16px;
`

const CustomFade = styled(Fade)`
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 0);
  width: 100%;
`

const Info = styled(Box)`
  display: flex;
  margin-top: -32px;
  padding-bottom: 16px;
  justify-content: center;
  visibility: ${(props) => props.visible ? 'visible' : 'hidden'};
  align-items: baseline;
`

const DiffWaitTime = styled(Typography)`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${(props) => props.theme.palette.enable.main};
`

export const WaitTimeChart = ({ timespanMeanWaitTime, waitTime }) => {

  const currentHours = new Date().getHours().toString()
  const currentTimespan = Object.keys(timespanMeanWaitTime).find(timespan => timespan.split('~')[0] === currentHours)
  const diffWaitTime = (waitTime > 0 && currentTimespan) ? waitTime - timespanMeanWaitTime[currentTimespan] : null
  const max = Math.max(waitTime, ...Object.values(timespanMeanWaitTime))

  const options = {
    chart: {
      toolbar: {
        show: false
      }
    },
    colors: Object.keys(timespanMeanWaitTime).map((timespan => timespan === currentTimespan ? '#00B7D0' : '#2B99FF')),
    plotOptions: {
      bar: {
        distributed: true,
        dataLabels: {
          position: 'top'
        }
      }
    },
    legend: {
      show: false
    },
    dataLabels: {
      offsetY: -24,
      enabled: true,
      style: {
        colors: ['#000']
      }
    },
    xaxis: {
      categories: Object.keys(timespanMeanWaitTime),
      labels: {
        rotateAlways: true
      }
    },
    yaxis: {
      show: false,
      max: max + 2,
      tickAmount: 4
    },
    annotations: {
      position: diffWaitTime > 0 ? 'back' : 'front',
      points: [{
        x: currentTimespan,
        y: waitTime,
        label: {
          text: String(waitTime),
          offsetY: 0,
          offsetX: -20
        },
        marker: {
          size: 0
        },
        image: {
          path: '/star.png',
          width: 20,
          height: 20,
          offsetY: 10
        }
      }]
    }
  }

  const series = [
    {
      name: '待ち時間',
      data: Object.values(timespanMeanWaitTime)
    }
  ]

  return (
    <Wrap>
      <Title>過去1週間の平均待ち時間</Title>
      <Chart
        options={waitTime < 0 ? dissoc('annotations', options) : options}
        series={series}
        type="bar"
        width="100%"
        height={240}
      />
      <CustomFade in={true} timeout={1000}>
        <Info visible={diffWaitTime !== null}>
          <Typography>ただいま、普段より</Typography>
          <DiffWaitTime>{Math.abs(diffWaitTime)}分</DiffWaitTime>
          <Typography>{diffWaitTime < 0 ? 'すいています' : 'こんでいます'}</Typography>
        </Info>
      </CustomFade>
    </Wrap>
  )
}