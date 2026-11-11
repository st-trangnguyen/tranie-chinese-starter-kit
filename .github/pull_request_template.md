#### References

> Describe what it related

- [Task/Bug URL]()
- [Related PR URL]()
- Spec PR: #<số PR docs> (PR code bắt buộc; PR spec phải review và merge trước) hoặc `N/A` nếu không có spec đi kèm
- OpenSpec change: `openspec/changes/<id>` hoặc `openspec/specs/<capability>` (ghi `N/A` nếu chỉ sửa docs, config, asset)

#### Description

> Describe what it implement
> Describe what it changed, added, removed

#### Screenshots

> UI screenshots for perfect pixel
> UI screenshots to show what is difference between before and after changing
> UI screenshots for Lighthouse reporting

<!-- Bắt buộc khi PR thay đổi giao diện (component, CSS, layout, icon, manifest): mobile 375×812 và desktop 1280×800, mỗi khổ sáng + tối (ảnh trên nhánh pr-assets, xem CLAUDE.md §8). Không liên quan UI thì ghi "N/A". -->

#### Checklist

> Note: Developer is responsible for checking your own code according to this checklist.

##### Requirement:

- [ ] Run correctly as the requirement.
- [ ] All new and changes have enough test suites.
- [ ] Mỗi Scenario có một test mang ID `S<epic>.<n>-AC<k>`, test được viết trước và đã thấy fail (RED).
- [ ] PR spec đã review và merge, mọi task trong `tasks.md` đã tick. Archive do workflow tự mở PR sau khi PR này merge.

##### Coding:

- [ ] CI status is success (build success, all tests passed, no errors & warnings from linter).
- [ ] Application architecture & project structure are kept.
- [ ] Following coding conventions, coding standards.
- [ ] All errors were handled correctly.

##### Performance:

- [ ] No infinity loop.
- [ ] Requires page load in under 3s
- [ ] No duplicated requests.
- [ ] Minimized duplicated components.
- [ ] No memory leak, no main thread blocking.

##### Security:

- [ ] No basic security flaws such as XSS, CSRF, Injection.
- [ ] No secret keys/tokens are written in the source code.
- [ ] No secret keys/tokens are compiled in the source build.
- [ ] No secret keys/tokens without restriction settings are used on the FE side.

##### UI/UX:

- [ ] Handle animation for hover, loading, processing behaviors.
