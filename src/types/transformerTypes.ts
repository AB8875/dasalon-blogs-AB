export type ISubmenu = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: boolean;
  parent_id: string;
  createdAt: string;
  updatedAt: string;
};

export type IMenuItem = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  submenus?: ISubmenu[];
};
export type ISocialMedia = {
  insta: string;
  facebook: string;
  linkdin: string;
  pinterest: string;
  path: string;
  icon: string;
};
export type IBlogs = {
  id: number;
  documentId: string;
  title: string;
  authors: ISubmenu[];
  description: string;
  createdAt: string;
  content: string;
  thumbnail: { url: string };
  categories: ISubmenu[];
  subcategories: ISubmenu[];
  tags: ISubmenu[];
};
export type ICardData = {
  cardClass?: string;
  path?: string;
  imgPath?: string;
  imgClass?: string;
  type?: string;
  typeClass?: string;
  time?: string;
  timeClass?: string;
  heading?: string;
  headingClass?: string;
  paraOne?: string;
  paraOneClass?: string;
  paraTwoClass?: string;
  discriptionClass?: string;
};
export type BaseBlogItem = {
  documentId: string;
  cardClass?: string;
  slug: string;
  thumbnail?: {
    formats?: {
      medium?: {
        url: string;
      };
    };
    url?: string;
  };
  categories?: {
    name: string;
  }[];
  createdAt?: string;
  imgClass?: string;
  typeClass?: string;
  timeClass?: string;
  title: string;
  headingClass?: string;
  description?: string;
};

export type TBlogItem = BaseBlogItem;

// Extend BaseBlogItem for BlogItem with additional properties
export type BlogItem = BaseBlogItem & {
  title?: string;
  paraOneClass?: string;
  authors?: {
    name: string;
  }[];
  paraTwoClass?: string;
};
export type IBlogItem = {
  slug: string;
  title?: string;
  description?: string;
  createdAt: string; // ISO string
  categories?: { name: string }[];
  thumbnail?: {
    url?: string;
    formats?: {
      medium?: {
        url?: string;
      };
    };
  };
};

export type IBlogCard = IBlogItem & {
  heading?: string;
  paraOne?: string;
};
export type NavDropdown = {
  dropdown: string;
  dropdownpath: string;
  _id: string;
};

export type NavLink = {
  title: string;
  titlePath: string;
  dropDown: NavDropdown[];
  dropdownClass?: string;
  _id: string;
};

export type NavbarClientProps = {
  navLinks: NavLink[];
};
export type BlogGroup = {
  categories: string;
  blogs: IBlogCard[];
  path: string;
};

export type Category = {
  name: string;
  documentId: string;
  menus: ISubmenu[];
};
export type FetchedSubmenuData = {
  data: {
    name?: string;
    image?: { url?: string };
    description?: string;
    submenus?: ISubmenu[];
  };
};
export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  description: string;
  createdAt: string;
  thumbnail?: {
    url?: string;
    formats?: {
      medium?: {
        url?: string;
      };
    };
  };
  categories?: { name: string }[];
  authors?: { name: string }[];
  cardClass?: string;
  imgClass?: string;
  typeClass?: string;
  timeClass?: string;
  headingClass?: string;
  paraOneClass?: string;
  paraTwoClass?: string;
};
