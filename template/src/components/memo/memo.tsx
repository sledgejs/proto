import './memo.scss';

import React, { HTMLAttributes, ReactNode, useId } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { MemoContent, MemoType } from './memoSchema';
import { getErrorDisplayMessage, isError } from '../../errors/errorUtils';

type Props = Omit<HTMLAttributes<{}>, 'content'> & {
  content?: MemoContent | null;
  type?: MemoType | null;
}

export const Memo = observer(({
  content,
  type,
  className,
  children,
  ...props
}: Props) => {

  content = content ?? children;
  if (!content)
    return null;

  let contentElem: ReactNode;
  if (isError(content)) {
    contentElem = <span className="memo-error-content">{getErrorDisplayMessage(content)}</span>
    // TODO: maybe add warning if there's a type specified via props
    type = MemoType.Error;
  } else
    contentElem = content;

  className = classNames(className, 'memo', {
    'error': type === MemoType.Error
  });

  return (
    <div className={className} {...props}>
      {contentElem ?? children}
    </div>
  );
});