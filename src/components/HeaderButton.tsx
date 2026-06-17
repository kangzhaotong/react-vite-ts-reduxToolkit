import { forwardRef } from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';

const HeaderButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...btnProps }, ref) => {
    return (
      <Button
        ref={ref}
        shape="circle"
        style={{ border: 'none', backgroundColor: 'transparent', fontSize: 14 }}
        block
        {...btnProps}
      >
        {children}
      </Button>
    );
  }
);

HeaderButton.displayName = 'HeaderButton';

export default HeaderButton;
