import Header from '../../Components/Header';
import { reportData } from '../data_h';

export default function SummaryHeaderSeverity() {
  return (
    <Header 
      title={reportData.title} 
      subtitle={reportData.subtitle} 
    />
  );
}