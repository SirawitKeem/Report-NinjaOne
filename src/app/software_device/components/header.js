import Header from '../../Components/Header';
import { reportData } from '../data';

export default function HeaderSoftwareDevice() {
  return (
    <Header 
      title={reportData.title} 
      subtitle={reportData.subtitle} 
    />
  );
}