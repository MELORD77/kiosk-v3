export function isSkeletonPreview(search: string): boolean {
  return (
    import.meta.env.DEV && new URLSearchParams(search).get('skeleton') === '1'
  );
}
