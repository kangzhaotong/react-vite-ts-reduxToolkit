import React from 'react';
import IntroduceRow from './components/IntroduceRow';
import { fetchAnalysisChart } from '@/services/api';
import useSWR from 'swr';
import SalesCard from './components/SalesCard';
import Ranking from './components/Ranking';
import BottomCards from './components/BottomCards';
import { Row, Col } from 'antd';

const Analysis: React.FC = () => {
  const { isLoading, data = {} } = useSWR('/AnalysisChart', fetchAnalysisChart);

  return (
    // eslint-disable-next-line react/jsx-fragments
    <>
      <IntroduceRow loading={isLoading} visitData={data.visitData || []} />
      <Row gutter={16}>
        <Col span={16}>
          <SalesCard loading={isLoading} data={data?.salesData || []} />
        </Col>
        <Col span={8}>
          <Ranking loading={isLoading} data={Array.from({ length: 18 })} />
        </Col>
      </Row>
      <BottomCards loading={isLoading} />
    </>
  );
};
export default Analysis;
