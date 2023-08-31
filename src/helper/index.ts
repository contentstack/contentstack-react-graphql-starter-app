/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Utils from "@contentstack/utils";
import { renderOption } from "../sdk/entry";
import { FooterRes, HeaderRes } from "../typescript/response";
import { BlogPostRes, Page } from "../typescript/pages";

import ContentstackLivePreview from "@contentstack/live-preview-utils";

const graphqlUrl = new URL(
  `https://dev11-graphql.csnonprod.com/stacks/${process.env.REACT_APP_CONTENTSTACK_API_KEY}?environment=${process.env.REACT_APP_CONTENTSTACK_ENVIRONMENT}`
);

const GRAPHQL_HOST_NAME = "dev11-graphql.csnonprod.com";
const LIVE_PREVIEW_HOST_NAME = "dev11-preview.csnonprod.com";
const liveEdit = process.env.REACT_APP_CONTENTSTACK_LIVE_EDIT_TAGS === "true";

function getHeaders() {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append(
    "access_token",
    process.env.REACT_APP_CONTENTSTACK_DELIVERY_TOKEN as string
  );
  return headers;
}

const gqlRequest = async (
  gql: string,
  options?: {
    variables?: Record<string, any>;
    operationName?: string;
  }
) => {
  const hash = ContentstackLivePreview.hash;
  const headers = getHeaders();

  if (hash) {
    headers.append("live_preview", hash);
    headers.append(
      "authorization",
      process.env.REACT_APP_CONTENTSTACK_MANAGEMENT_TOKEN as string
    );
    graphqlUrl.hostname = LIVE_PREVIEW_HOST_NAME;
  } else {
    graphqlUrl.hostname = GRAPHQL_HOST_NAME;
  }

  const body: Record<string, any> = {
    query: gql,
  };

  body.variables = options?.variables || null;
  if (options?.operationName) {
    body.operationName = options.operationName;
  }

  const res = await fetch(graphqlUrl.toString(), {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });

  return res;
};

export const getHeaderRes = async (): Promise<HeaderRes> => {
  const gql = `
query HeaderQuery {
  all_header {
    total
    items {
      title
      logoConnection {
        edges {
          node {
            url
            filename
          }
        }
      }
      navigation_menu {
        label
        page_referenceConnection {
          totalCount
          edges {
            node {
              ... on Page {
                title
                url
              }
            }
          }
        }
      }
      notification_bar {
        show_announcement
        announcement_text {
          json
        }
      }
      system {
        uid
      }
    }
  }
}
`;

  const res = await gqlRequest(gql);

  const data = await res.json();

  const header = data.data.all_header.items[0];

  const transformed = {
    ...header,
    logo: header.logoConnection.edges[0].node,
    navigation_menu: header.navigation_menu.map((item: any) => ({
      ...item,
      page_reference: item.page_referenceConnection.edges.map(
        (edge: any) => edge.node
      ),
    })),
    uid: header.system.uid,
    notification_bar: {
      ...header.notification_bar,
    },
  };

  Utils.GQL.jsonToHTML({
    entry: transformed,
    paths: ["notification_bar.announcement_text"],
    renderOption: renderOption,
  });

  liveEdit && Utils.addEditableTags(transformed, "header", true);

  return transformed;
};

export const getFooterRes = async (): Promise<FooterRes> => {
  const gql = `
query FooterQuery {
  all_footer {
    total
    items {
      title
      logoConnection {
        edges {
          node {
            url
            filename
          }
        }
      }
      navigation {
        link {
          href
          title
        }
      }
      social {
        social_share {
          link {
            href
            title
          }
          iconConnection {
            edges {
              node {
                url
                filename
              }
            }
          }
        }
      }
      copyright {
        json
      }
      system {
        uid
      }
    }
  }
}

`;

  const res = await gqlRequest(gql);

  const data = await res.json();

  const footer = data.data.all_footer.items[0];

  const transformed = {
    ...footer,
    logo: footer.logoConnection.edges[0].node,
    social: {
      social_share: footer.social.social_share.map((item: any) => ({
        ...item,
        icon: item.iconConnection.edges[0].node,
      })),
    },
    uid: footer.system.uid,
    copyright: {
      ...footer.copyright,
    },
  };

  Utils.GQL.jsonToHTML({
    entry: transformed,
    paths: ["copyright"],
    renderOption: renderOption,
  });

  liveEdit && Utils.addEditableTags(transformed, "footer", true);
  return transformed as FooterRes;
};

export const getPageRes = async (entryUrl: string): Promise<Page> => {
  const hero_banner = `
        ... on PagePageComponentsHeroBanner {
          hero_banner {
            text_color
            bg_color
            banner_description
            banner_title
            call_to_action {
              href
              title
            }
            banner_imageConnection {
              edges {
                node {
                  url
                  content_type
                  description
                  file_size
                  filename
                  metadata
                  dimension {
                    height
                    width
                  }
                  system {
                    uid
                  }
                  title
                  unique_identifier
                }
              }
            }
          }
        }
`;

  const section = `
        ... on PagePageComponentsSection {
          section {
            title_h2
            call_to_action {
              href
              title
            }
            description
            image_alignment
            imageConnection {
              edges {
                node {
                  url
                  unique_identifier
                  title
                  metadata
                  filename
                  file_size
                  description
                  content_type
                }
              }
            }
          }
        }
`;

  const section_with_buckets = `
        ... on PagePageComponentsSectionWithBuckets {
          section_with_buckets {
            title_h2
            description
            bucket_tabular
            buckets {
              title_h3
              call_to_action {
                href
                title
              }
              description {
                json
              }
              iconConnection {
                edges {
                  node {
                    url
                    filename
                  }
                }
              }
            }
          }
        }
`;

  const from_blog = `
        ... on PagePageComponentsFromBlog {
          from_blog {
            title_h2
            view_articles {
              href
              title
            }
            featured_blogsConnection {
              edges {
                node {
                  ... on BlogPost {
                    title
                    url
                    featured_imageConnection {
                      edges {
                        node {
                          filename
                          url
                        }
                      }
                    }
                    body {
                      json
                    }
                  }
                }
              }
            }
          }
        }
`;

  const section_with_cards = `
        ... on PagePageComponentsSectionWithCards {
          section_with_cards {
            cards {
              call_to_action {
                href
                title
              }
              description
              title_h3
            }
          }
        }
`;

  const our_team = `
        ... on PagePageComponentsOurTeam {
          our_team {
            title_h2
            description
            employees {
              designation
              name
              imageConnection {
                edges {
                  node {
                    url
                    filename
                  }
                }
              }
            }
          }
        }
`;

  const widget = `
        ... on PagePageComponentsWidget {
          widget {
            title_h2
            type
          }
        }
`;

  const section_with_html_code = `
        ... on PagePageComponentsSectionWithHtmlCode {
          section_with_html_code {
            title
            html_code_alignment
            html_code
            description {
              json
            }
          }
        }
`;

  const final = `
query PageQuery($url: String!) {
  all_page(where: {url: $url}) {
    total
    items {
      page_components {
        ${hero_banner}
        ${section}
        ${section_with_buckets}
        ${from_blog}
        ${section_with_cards}
        ${our_team}
        ${widget}
        ${section_with_html_code}
      }
      url
      title
      system {
        locale
        tags
        uid
      }
      seo {
        enable_search_indexing
        keywords
        meta_description
        meta_title
      }
    }
  }
}
`;

  const res = await gqlRequest(final, {
    variables: {
      url: entryUrl,
    },
  });

  const data = await res.json();
  const total = data.data.all_page.total;
  const page = data.data.all_page.items[total - 1];

  const final_data = {
    ...page,
    tags: page.system.tags,
    locale: page.system.locale,
    uid: page.system.uid,
  };

  if (page.page_components.find((item: any) => item.hero_banner)) {
    const hero_banner = final_data.page_components.find(
      (item: any) => item.hero_banner
    ).hero_banner;

    hero_banner.banner_image =
      hero_banner.banner_imageConnection?.edges[0]?.node;
  }

  if (page.page_components.find((item: any) => item.section)) {
    const section = final_data.page_components.find(
      (item: any) => item.section
    ).section;

    section.image = section.imageConnection.edges[0].node;
  }

  if (page.page_components.find((item: any) => item.section_with_buckets)) {
    Utils.GQL.jsonToHTML({
      entry: final_data,
      paths: ["page_components.section_with_buckets.buckets.description"],
      renderOption: renderOption,
    });
  }

  if (page.page_components.find((item: any) => item.from_blog)) {
    Utils.GQL.jsonToHTML({
      entry: final_data,
      paths: [
        "page_components.from_blog.featured_blogsConnection.edges.node.body",
      ],
      renderOption: renderOption,
    });

    const from_blog = final_data.page_components.find(
      (item: any) => item.from_blog
    ).from_blog;

    from_blog.featured_blogs = from_blog.featured_blogsConnection.edges.map(
      (edge: any) => {
        return edge.node;
      }
    );

    from_blog.featured_blogs.forEach((blog: any) => {
      blog.featured_image = blog.featured_imageConnection.edges[0].node;
    });
  }

  if (page.page_components.find((item: any) => item.section_with_cards)) {
    // this part has no transformations
  }

  if (page.page_components.find((item: any) => item.our_team)) {
    const our_team = final_data.page_components.find(
      (item: any) => item.our_team
    ).our_team;
    our_team.employees.forEach((employee: any) => {
      employee.image = employee.imageConnection.edges[0].node;
    });
  }

  if (page.page_components.find((item: any) => item.section_with_cards)) {
    // this part has no transformations
  }

  if (page.page_components.find((item: any) => item.widget)) {
    // this part has no transformations
  }

  if (page.page_components.find((item: any) => item.section_with_html_code)) {
    console.log(final_data);
    const all: any[] = [];

    page.page_components.forEach((item: any) => {
      if (item.section_with_html_code) {
        all.push(item.section_with_html_code);
      }
    });

    Utils.GQL.jsonToHTML({
      entry: final_data,
      paths: ["page_components.section_with_html_code.description"],
      renderOption: renderOption,
    });
  }

  liveEdit && Utils.addEditableTags(final_data, "page", true);

  return final_data;
};

export const getBlogListRes = async (): Promise<{
  archivedBlogs: BlogPostRes[];
  recentBlogs: BlogPostRes[];
}> => {
  const query = `
query BlogListQuery {
  all_blog_post {
    items {
      url
      title
      featured_imageConnection {
        edges {
          node {
            url
          }
        }
      }
      is_archived
      date
      authorConnection {
        edges {
          node {
            ... on Author {
              title
            }
          }
        }
      }
      body {
        json
      }
    }
  }
}
`;

  const res = await gqlRequest(query, {
    // BUG: assets will not be fetched if operationName is not provided
    operationName: "BlogListQuery",
  });

  const data = await res.json();

  const blogs = data.data.all_blog_post.items;

  blogs.forEach((blog: any) => {
    blog.featured_image = blog.featured_imageConnection.edges[0].node;
    blog.author = [blog.authorConnection.edges[0].node];
  });

  const archivedBlogs = [] as BlogPostRes[];
  const recentBlogs = [] as BlogPostRes[];

  blogs.forEach((blog: any) => {
    if (blog.is_archived) {
      archivedBlogs.push(blog);
    } else {
      recentBlogs.push(blog);
    }
  });

  Utils.GQL.jsonToHTML({
    entry: blogs,
    paths: ["body"],
    renderOption: renderOption,
  });

  liveEdit &&
    blogs.forEach((entry: any) =>
      Utils.addEditableTags(entry, "blog_post", true)
    );

  return {
    archivedBlogs,
    recentBlogs,
  };
};

export const getBlogPostRes = async (
  entryUrl: string
): Promise<BlogPostRes> => {
  const query = `
query BlogPostQuery($url: String!) {
  all_blog_post(where: {url: $url}) {
    items {
      url
      title
      featured_imageConnection {
        edges {
          node {
            url
          }
        }
      }
      is_archived
      date
      authorConnection {
        edges {
          node {
            ... on Author {
              title
            }
          }
        }
      }
      body {
        json
      }
      related_postConnection {
        edges {
          node {
            ... on BlogPost {
              title
              url
              body {
                json
              }
            }
          }
        }
      }
      system {
        uid
      }
    }
  }
}

`;

  const res = await gqlRequest(query, {
    variables: {
      url: entryUrl,
    },
  });

  const data = await res.json();

  const blogs = data.data.all_blog_post.items;

  blogs.forEach((blog: any) => {
    blog.featured_image = blog.featured_imageConnection.edges[0].node;
    blog.author = [blog.authorConnection.edges[0].node];
    blog.related_post = blog.related_postConnection.edges.map(
      (edge: any) => edge.node
    );
    blog.uid = blog.system.uid;
  });

  Utils.GQL.jsonToHTML({
    entry: blogs,
    paths: ["body", "related_post.body"],
    renderOption: renderOption,
  });

  liveEdit && Utils.addEditableTags(blogs[0], "blog_post", true);

  return blogs[0] as any;
};
