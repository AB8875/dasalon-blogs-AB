// NEW: Complete Author type with all fields from Strapi
export type Author = {
  _id: string;
  name: string;
  email?: string;
  image?: string;
  description?: string;
  education?: string;
  address?: string;
  instagram?: string;
  linkedin?: string;
  index?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ISubmenu = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  showOnHomePage?: boolean;  // NEW
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
  index?: number;  // NEW
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
      large?: {
        url: string;
      };
      medium?: {
        url: string;
      };
      small?: {
        url: string;
      };
      thumbnail?: {
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
  content?: string;
};

export type TBlogItem = BaseBlogItem;

// Extend BaseBlogItem for BlogItem with additional properties
export type BlogItem = BaseBlogItem & {
  title?: string;
  paraOneClass?: string;
  authors?: Author[];  // UPDATED: Use full Author type
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
      large?: {
        url?: string;
      };
      medium?: {
        url?: string;
      };
      small?: {
        url?: string;
      };
      thumbnail?: {
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
      large?: {
        url?: string;
      };
      medium?: {
        url?: string;
      };
      small?: {
        url?: string;
      };
      thumbnail?: {
        url?: string;
      };
    };
  };
  categories?: { name: string }[];
  authors?: Author[];  // UPDATED: Use full Author type
  menus?: string[];  // NEW: Array of menu slugs
  submenus?: string[];  // NEW: Array of submenu slugs
  tags?: string[];  // NEW: Array of tags
  featured?: boolean;  // NEW
  views?: number;  // NEW
  index?: number;  // NEW: Display order
  cardClass?: string;
  imgClass?: string;
  typeClass?: string;
  timeClass?: string;
  headingClass?: string;
  paraOneClass?: string;
  paraTwoClass?: string;
};
