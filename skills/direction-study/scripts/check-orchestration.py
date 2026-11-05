#!/usr/bin/env python3
"""Validate ordered study receipts derived from a tool transcript. No taste certification."""
import argparse
import json
from pathlib import Path, PurePosixPath


def check(data, fixture=None, output_root=None):
    events = data['events']
    host = data.get('host', 'claude-code-project')
    plugin = host == 'cowork-plugin'
    folder = host == 'folder-execution'
    output = data.get('output', {})
    standalone = (output.get('target') == 'standalone-web' and
                  output.get('connected_folder') is True and output.get('existing_app') is False)
    default_html = standalone and output.get('mode') != 'explicit-user-request'

    prefix = data.get('skill_root', 'skills') if folder else ('skills' if plugin else '.claude/skills')

    errors = []
    def require(test, message):
        if not test:
            errors.append(message)
    def local_path(value, extensions):
        if not isinstance(value, str) or not value:
            return False
        path = PurePosixPath(value)
        good = not path.is_absolute() and '..' not in path.parts and ':' not in value and path.suffix in extensions
        if good and output_root:
            resolved = (output_root / value).resolve()
            good = resolved.is_relative_to(output_root) and resolved.is_file()
        return good
    def rows(kind, direction=None):
        return [(i, e) for i, e in enumerate(events)
                if e['event'] == kind and (direction is None or e.get('direction') == direction)]
    def first(kind, direction=None):
        matches = rows(kind, direction)
        require(bool(matches), f'{direction or "study"}: missing {kind}')
        return matches[0] if matches else (-1, {})
    def invocation(skill, direction=None):
        matches = [(i, e) for i, e in rows('execute' if folder else 'invoke', direction) if e.get('skill') == skill]
        require(bool(matches), f'{direction or "study"}: {skill} workflow was not activated/executed in this mode')
        return matches[0] if matches else (-1, {})

    require(output.get('target') in ('standalone-web', 'existing-web', 'native', 'figma'),
            'output target missing/unsupported')
    if standalone and output.get('mode') == 'explicit-user-request':
        require(bool(output.get('user_request_evidence')), 'alternative output needs user request evidence')
    if default_html:
        require(local_path(output.get('index'), {'.html'}), 'local index missing or outside selected folder')
    require(host in ('claude-code-project', 'cowork-plugin', 'folder-execution'), 'unsupported host')
    if folder:
        require(bool(data.get('runtime')), 'folder execution must identify its actual runtime')
        require(prefix in ('skills', '.claude/skills'), 'unsupported local skills layout')
    require(data.get('route') in ('reference-led', 'reference-directed', 'brief-originated'),
            'unsupported study route')
    require(bool(events), 'empty trace')
    for e in events:
        require(bool(e.get('evidence')), 'event lacks transcript/artifact evidence locator')
        if e['event'] not in ('invoke', 'execute', 'read', 'load'):
            continue
        skill = e.get('skill', '')
        origin = e.get('origin', '')
        expected = f'{prefix}/{skill}/SKILL.md'
        require(origin == expected, f'{skill}: external or ambiguous skill origin')
        if fixture and prefix in ('skills', '.claude/skills'):
            path = fixture / expected
            require(path.is_file() and path.resolve() == path.absolute(),
                    f'{skill}: missing or symlinked project skill')
        require(skill != 'frontend-design', 'external design producer active')
        if data.get('route') == 'reference-led':
            require(skill != 'starter-directions', 'starter active in reference-led work')
        if folder and e['event'] == 'invoke':
            require(False, 'folder-only run must not substitute or claim native design activation')
        if e['event'] == ('execute' if folder else 'invoke'):
            if folder:
                require(e.get('mechanism') == 'folder-workflow' and e.get('source_evidence') and
                        e.get('execution_evidence'),
                        f'{skill}: reading alone is not folder workflow execution')
            elif plugin:
                require(e.get('registered_name') == f'agentic-design-kit:{skill}',
                        f'{skill}: wrong plugin registration')
                require(e.get('mechanism') in ('Skill', 'registered-skill') and
                        bool(e.get('activation_evidence')),
                        f'{skill}: missing native activation evidence; file read alone is insufficient')
            else:
                require(e.get('mechanism') == 'Skill', f'{skill}: file read is not Skill invocation')
            if skill == 'ia-review':
                require(bool(e.get('material_unresolved_structure')),
                        'IA invoked without material unresolved structure')

    start, _ = invocation('direction-study')
    developed, _ = first('directions-developed')
    divergent, _ = first('divergence-checked')
    require(0 <= start < developed < divergent, 'direction-study invocation/exploration order')
    if data.get('route', '').startswith('reference-'):
        refs, original = first('references-viewed')
        require(start < refs < developed and bool(original.get('originals')),
                'originals must be viewed before directions develop')
        intake_at, intake = first('reference-intake')
        require(refs < intake_at < developed, 'reference discovery must precede directions')
        require(intake.get('closeness') in ('loose', 'rearranged', 'close') and
                intake.get('decision_evidence'), 'reference closeness needs a human answer')
        require(bool(intake.get('approval_date')), 'reference decisions need their date')
        decisions = intake.get('trait_decisions', [])
        require(bool(decisions) and all(
            d.get('decision') in ('approved', 'declined', 'qualified', 'none-gated') and
            d.get('evidence') for d in decisions), 'unresolved reference/rule conflict')
        for source in original.get('originals', []):
            traits = intake.get('traits', {}).get(source, [])
            require(3 <= len(traits) <= 5 and all(traits),
                    f'{source}: record 3–5 observed defining traits')
        require(intake.get('image_permission') and intake.get('image_permission_evidence'),
                'imagery dependency needs an explicit disposition')
    contracts = rows('contract')
    directions = [e['direction'] for _, e in contracts]
    require(bool(directions) and len(set(directions)) == len(directions), 'missing/duplicate contracts')
    compare, comparison = first('compare')
    require(set(comparison.get('directions', [])) == set(directions), 'comparison omits a direction')
    require(set(comparison.get('axes', [])) == {
        'reference-resonance', 'similarity', 'genericness', 'mechanical-quality'},
        'comparison must preserve four independent judgements')
    require(set(comparison.get('recommended', [])) <= set(directions), 'unknown recommendation')
    if data.get('route', '').startswith('reference-'):
        for source in original.get('originals', []):
            coverage = comparison.get('reference_coverage', {}).get(source, [])
            require((bool(coverage) and set(coverage) <= set(directions)) or
                    comparison.get('omission_approvals', {}).get(source),
                    f'{source}: unused reference needs human confirmation')
    for kind in ('proof-built', 'render-inspected', 'distinctiveness-completed', 'reference-review'):
        require({e.get('direction') for _, e in rows(kind)} == set(directions),
                f'{kind}: direction coverage differs from contracts')

    for contract, c in contracts:
        d = c['direction']
        guard, g = invocation('ui-design-principles', d)
        index, _ = first('rules-index', d)
        proof, p = first('proof-built', d)
        render, r = first('render-inspected', d)
        reviewer, v = invocation('distinctiveness-review', d)
        visual, j = first('visual-judgement', d)
        detector, _ = first('detector', d)
        scan, _ = first('ui-scan', d)
        done, result = first('distinctiveness-completed', d)
        reference, rr = first('reference-review', d)
        require(divergent < contract < guard < index < proof < render < reviewer < visual,
                f'{d}: contract → guardrail → detailed rules → proof → render → review order')
        require(g.get('mode') == 'study-proof', f'{d}: production guardrail used for proof')
        if default_html:
            require(p.get('format') == 'html', f'{d}: standalone web defaults to local HTML')
            require(local_path(p.get('artifact'), {'.html'}), f'{d}: proof outside selected folder or missing HTML')
            views = r.get('views', {})
            for view in ('desktop', 'mobile'):
                require(local_path(views.get(view), {'.png', '.jpg', '.jpeg', '.webp'}),
                        f'{d}: missing local {view} rendered screenshot')
        elif standalone:
            require(p.get('output_choice') == 'explicit-user-request' and p.get('user_request_evidence'),
                    f'{d}: alternative standalone proof needs explicit request evidence')
        require(bool(p.get('decisions')), f'{d}: no visual decisions recorded')
        sections = rows('rules-section', d)
        for decision in p.get('decisions', []):
            require(any(index < i < proof and e.get('decision') == decision and e.get('section')
                        for i, e in sections), f'{d}: detailed rules missing for {decision}')
        if data.get('route', '').startswith('reference-'):
            require(p.get('originals_visible') is True, f'{d}: originals hidden during proof')
            require(p.get('asset_plan_evidence') and p.get('imagery_status'),
                    f'{d}: missing direction-specific image plan')
            require(rr.get('blind_first') is True and rr.get('observation_report') and
                    rr.get('contract_after_observation') is True,
                    f'{d}: reference review must observe originals before builder notes')
            require(rr.get('lead_reference') in original.get('originals', []),
                    f'{d}: reference review needs its lead source')
            changes = rr.get('structural_changes', [])
            close_exception = (intake.get('closeness') == 'close' and
                               rr.get('close_recreation_permission'))
            require(len(set(changes)) >= 2 or close_exception,
                    f'{d}: fewer than two structural changes from lead reference')
        require(bool(r.get('render')), f'{d}: render locator missing')
        require(v.get('independent') is True and bool(v.get('context')) and
                v.get('builder_preference') is False and v.get('other_conclusions') is False,
                f'{d}: reviewer is not independent/unprimed')
        require(set(v.get('inputs', [])) >= {'brief','original-references','contract','render'},
                f'{d}: review inputs incomplete')
        for event in (j, result, events[detector] if detector >= 0 else {},
                      events[scan] if scan >= 0 else {}):
            require(event.get('context') == v.get('context') and bool(v.get('context')),
                    f'{d}: reviewer context mismatch')
        require(visual < detector < done < compare and visual < scan < done,
                f'{d}: visual judgement must precede detector and scan; completion before comparison')
        require(render < reference < compare and rr.get('resonance') and rr.get('similarity'),
                f'{d}: independent reference judgements missing before comparison')
        require(result.get('genericness') in ('clear', 'confirmed', 'unassessed'),
                f'{d}: genericness judgement missing')
        require(bool(j.get('report')) and bool(result.get('report')) and bool(rr.get('report')),
                f'{d}: review artifact locators missing')
        if result.get('genericness') != 'clear':
            require(d not in comparison.get('recommended', []),
                    f'{d}: confirmed/unassessed genericness cannot be positively recommended')
    stop, s = first('stop')
    require(compare < stop == len(events)-1 and s.get('state') == 'STUDY — DECISION REQUIRED',
            'study must stop for human decision after comparison')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('trace', type=Path)
    parser.add_argument('--fixture', type=Path, help='consumer root; authenticate origins after preflight')
    parser.add_argument('--output-root', type=Path, help='selected project/output root; verify files actually exist')
    args = parser.parse_args()
    try:
        errors = check(json.loads(args.trace.read_text()), args.fixture.resolve() if args.fixture else None,
                       args.output_root.resolve() if args.output_root else None)
    except (KeyError, TypeError, ValueError, OSError) as exc:
        errors = [f'malformed receipt: {exc}']
    for error in errors:
        print(f'INVALID — {error}')
    if not errors:
        print('PASS — orchestration receipt shape/order; verify against tool transcript and renders')
    return bool(errors)

if __name__ == '__main__':
    raise SystemExit(main())
