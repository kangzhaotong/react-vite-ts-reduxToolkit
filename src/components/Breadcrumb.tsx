/*
 * @Author: M78.Kangzhaotong
 * @Date: 2023-04-03 16:26:38
 * @Last Modified by:   M78.Kangzhaotong
 * @Last Modified time: 2023-04-03 16:26:38
 */
import React, { useMemo } from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { selectBreadcrumb, setBreadcrumb } from '@/store/reducer/layoutSlice';
import { MenuItem } from '@/config';

/**
 * Layout面包屑
 * @param {Array<String | {name: String; path: String}>} data
 * @returns
 */
export default function LayoutBreadcrumb() {
  const breadcrumb = useAppSelector(selectBreadcrumb);
  const breadItems = useMemo(
    () =>
      breadcrumb.map((item, index) => {
        if (typeof item === 'object') {
          return { title: <Link to={item.path}>{item.name}</Link> };
        }
        return { title: item };
      }),
    [breadcrumb]
  );

  return breadcrumb.length > 0 ? (
    <Breadcrumb separator=">" items={breadItems} />
  ) : (
    <div style={{ height: 16 }} />
  );
}

interface UseBreadcrumbfromMenuDataProps {
  menu: MenuItem[];
  menuStatePathKeys: string[];
}

/**
 * 渲染来自菜单数据的面包屑
 */
export function useBreadcrumbfromMenuData(
  { menu, menuStatePathKeys = [] }: UseBreadcrumbfromMenuDataProps,
  deps: React.DependencyList
) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!menuStatePathKeys[0]) {
      return;
    }
    const breadcrumbPath: string[] = [];
    menuStatePathKeys.reduce((data, pathKey: string) => {
      const currentLevel = (data.find((menuitem) => menuitem.key === pathKey) ||
        {}) as MenuItem;
      breadcrumbPath.push(currentLevel.label);
      return currentLevel?.children || [];
    }, menu);
    dispatch(setBreadcrumb(breadcrumbPath));
  }, deps);
}
