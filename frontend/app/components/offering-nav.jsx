import { NavLink } from 'react-router';

/**
 * The offering's pages as one set, in the order a conversation travels: the
 * map, the three packs, where they stop, what can be bought on top, and how a
 * figure is built.
 *
 * It takes the crumb's place at the top of the band. The pages used to link
 * back to the map and nowhere else, so the add-on prices and the estimate
 * behind them were a footer link away from the pack a consultant was reading.
 *
 * @param {{ packs: { code: string, name: string }[] }} props
 */
export function OfferingNav({ packs = [] }) {
  const pages = [
    { to: '/offering', label: 'Offering', end: true },
    // The letter the engine files a pack under and the word the room uses for
    // it: every pack is "Ecommerce" something, so the word is the rest.
    ...packs.map((p) => ({ to: `/offering/${p.code.toLowerCase()}`, label: `${p.code} · ${p.name.replace(/^Ecommerce\s+/, '')}` })),
    { to: '/offering/arc', label: 'Merkle Arc' },
    { to: '/offering/addons', label: 'Add-ons' },
    { to: '/offering/estimation', label: 'How we estimate' },
  ];
  return (
    <nav className="tabs offering-tabs" aria-label="The offering">
      {pages.map((p) => <NavLink key={p.to} to={p.to} end={p.end}>{p.label}</NavLink>)}
    </nav>
  );
}
