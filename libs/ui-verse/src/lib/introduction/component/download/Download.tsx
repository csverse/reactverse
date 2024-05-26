import Template from '../../../utils/hoc/Template';
import resume from '../../../../assets/misc/Neel Ratn Resume.pdf';
import Button from '../../../button/Button';
import { IconDownload } from '@tabler/icons-react';

export const Download = () => {
  return (
    <div style={{}}>
      <span>Download My Resume 💁‍♂️</span>
      <span>
        <Template>
          <a href={resume} target="_blank">
            <Button rightSection={<IconDownload size={14} />}>Download</Button>
          </a>
        </Template>
      </span>
    </div>
  );
};

export default Download;
