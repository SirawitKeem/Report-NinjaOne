import Header from '../../Components/Header';
import { reportData } from '../data';

export default function SummaryHeader() {
  return (
    <Header 
      title={reportData.title} 
      subtitle={reportData.subtitle} 
    />
  );
}