# Hướng dẫn dùng phân trang

1. Trong file view hbs

```
<div>
    {{#pagination currentPage totalPage 5}}
        <nav aria-label="...">
            <ul class="pagination justify-content-center">
                {{#if notFirstPage}}
                <li class="page-item">
                    <a
                    class="page-link fs-5"
                    href="{{getPagiUrl ../url}}&page={{minus currentPage 1}}"
                    tabindex="-1"
                    aria-disabled="true"
                    >Previous</a>
                </li>
                {{/if}}
                {{#each pages}}
                <li class="page-item {{#if this.isCurrent}}active{{/if}}">
                    <a class="page-link fs-5" href="{{getPagiUrl ../../url}}&page={{this.page}}">{{this.page}}</a>
                </li>
                {{/each}}
                {{#if notLastPage}}
                <li class="page-item">
                    <a class="page-link fs-5" href="{{getPagiUrl ../url}}&page={{sum currentPage 1}}">Next</a>
                </li>
                {{/if}}
            </ul>
        </nav>
    {{/pagination}}
</div>
```

2. Trong cần controller cần truyền về: url, currentPage, totalPage. dataPage mảng chứa toàn bộ dữ liệu lúc chưa đc phân trang tức là không có: .paginate(req)

```
const url = req.url;
let [currentPage, totalPage, countChild] = getDataPagination(dataPagi,req);
```

3. Dữ liệu render phải được: .paginate(req) hoặc tự custom

```
Product.find({}).paginate(req)
```
