import { paginateLocally } from "./paginate";

const items = Array.from({ length: 45 }, (_, index) => index + 1);

describe("paginateLocally", () => {
  it("returns the requested page with the backend meta shape", () => {
    const { pageItems, meta } = paginateLocally(items, 3, 20);

    expect(pageItems).toEqual([41, 42, 43, 44, 45]);
    expect(meta).toEqual({ page: 3, pageSize: 20, total: 45, totalPages: 3 });
  });

  it("moves back to the last page when a filter leaves fewer results", () => {
    expect(paginateLocally(items.slice(0, 5), 3, 20).meta.page).toBe(1);
  });

  it("handles an empty list", () => {
    expect(paginateLocally([], 1, 20)).toEqual({
      pageItems: [],
      meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 },
    });
  });
});
