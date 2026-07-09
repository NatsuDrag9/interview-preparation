import { Component, Input, OnInit } from "@angular/core";

export interface Column<T> {
  label: string;
  key: keyof T;
}

export type SortDirection = "asc" | "desc";

@Component({
  selector: "data-table",
  templateUrl: "./data-table.template.html",
  styleUrls: ["./data-table.component.scss"],
  standalone: true,
})
export class DataTableComponent<
  T extends Record<string, unknown>,
> implements OnInit {
  @Input() data!: T[];
  @Input() columns!: Column<T>[];
  @Input() getRowKey!: (row: T) => string | number;

  page = 1;
  pageSize = 5;
  sortField!: keyof T;
  sortDirection: SortDirection = "asc";

  ngOnInit() {
    this.sortField = this.columns[0].key;
  }

  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }

  onPageSizeSelect(value: string | number) {
    this.pageSize = Number(value);
    this.page = 1;
  }

  onNext() {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  onSort(key: keyof T) {
    if (this.sortField === key) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortDirection = "asc";
      this.sortField = key;
    }

    this.page = 1;
  }

  get sortedData(): T[] {
    const clone = [...this.data];
    const field = this.sortField;
    const direction = this.sortDirection;

    return clone.sort((a, b) => {
      const left = a[field];
      const right = b[field];

      let result = 0;

      if (typeof left === "number" && typeof right === "number") {
        result = left - right;
      } else {
        result = String(left).localeCompare(String(right));
      }

      return direction === "asc" ? result : -result;
    });
  }

  get pageData(): T[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;

    return this.sortedData.slice(start, end);
  }

  onPrevious() {
    if (this.page > 1) {
      this.page--;
    }
  }
}
