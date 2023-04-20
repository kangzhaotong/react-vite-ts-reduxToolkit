import IntroduceRow from './components/IntroduceRow';
import { fetchAnalysisChart } from '@/services/api';
import useSWR from 'swr';
import SalesCard from './components/SalesCard';
import Ranking from './components/Ranking';
import BottomCards from './components/BottomCards';
import { Row, Col } from 'antd';

export default function Analysis() {
  const { isLoading, data = {} } = useSWR('/AnalysisChart', fetchAnalysisChart);

  return (
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
}
