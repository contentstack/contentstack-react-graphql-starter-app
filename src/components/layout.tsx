import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import DevTools from "./devtools";
import { getHeaderRes, getFooterRes } from "../helper";
import { onEntryChange } from "../utils/live-preview";
import { EntryProps } from "../typescript/components";
import { FooterRes, HeaderRes, NavigationMenu } from "../typescript/response";
import { Link } from "../typescript/pages";

export default function Layout({ entry }: { entry: EntryProps }) {
  const history = useNavigate();
  const [getLayout, setLayout] = useState({
    header: {} as HeaderRes,
    footer: {} as FooterRes,
    navHeaderList: [] as NavigationMenu[],
    navFooterList: [] as Link[],
  });
  const mergeObjs = (...objs: any) => Object.assign({}, ...objs);
  const jsonObj = mergeObjs(
    { header: getLayout.header },
    { footer: getLayout.footer },
    entry
  );

  const [error, setError] = useState(false);

  async function fetchData() {
    try {
      const header = await getHeaderRes();
      const footer = await getFooterRes();
      !header || (!footer && setError(true));
      const navHeaderList = header.navigation_menu;
      const navFooterList = footer.navigation.link;

      setLayout({
        header: header,
        footer: footer,
        navHeaderList,
        navFooterList,
      });
    } catch (error) {
      setError(true);
      console.error(error);
    }
  }

  useEffect(() => {
    onEntryChange(fetchData);
  }, []);

  useEffect(() => {
    console.error("error...", error);
    error && history("/error");
  }, [error]);

  return (
    <div className="layout">
      <Header header={getLayout.header} navMenu={getLayout.navHeaderList} />
      <DevTools response={jsonObj} />
      <Outlet />
      <Footer footer={getLayout.footer} navMenu={getLayout.navFooterList} />
    </div>
  );
}
