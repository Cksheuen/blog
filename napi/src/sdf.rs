use crate::utils::{Vec3, Vec2, fbm, smoothstep, fbm_vec3};
use crate::utils;


fn cal_model_ground(p: utils::Vec2) -> f64 {
    let fbm_num = utils::fbm(p);
    fbm_num + 1.
}

pub fn do_model_ground(p: utils::Vec3) -> f64 {
    let h = cal_model_ground(utils::Vec2::new(p.x, p.z));
    let ground = p.y - h;
    ground
}

const SCALE: f64 = 100.;
const TREE_RADIUS: f64 = 1.;

fn cal_model_tree(pos: Vec3) -> (Vec3, Vec3) {
    let mut st = Vec2::new(pos.x , pos.z);
    st = st * SCALE;
    st = (st / TREE_RADIUS / 2.).floor();

    let mut n = 107. * st.x + 113. * st.y + 131.;
    n += 77648.;

    let lamda = (((Vec2::new(0., 1.) + n) / 3.14).fract() * n).fract();

    let n_height =  0.01 * smoothstep(0., 1., fbm(Vec2::new(st.x, st.y)));

    let tree_pos_cen = st / SCALE; // tree_radius * tree_pos + tree_radius / 2.;
    let tree_ground = cal_model_ground(tree_pos_cen);

    let tree_height = TREE_RADIUS / SCALE / 2. + n_height;
    let mut r = (Vec3::new(1., 1.5, 1.) +  Vec3::new(0.4, 0.5, 0.4) * lamda.x +
        Vec3::new(0.6, 0., 0.6))* tree_height * 0.7 * lamda.y;
    let lamda5 = smoothstep(0., 0.1, fbm(st));
    r.x = r.x * (0.5 + lamda5 * 0.5);
    r.y = r.y * (1.6 - lamda5 * 0.3);
    r.z = r.z * (0.5 + lamda5 * 0.5);

    let tree_center = Vec3::new(tree_pos_cen.x, tree_ground + r.y, tree_pos_cen.y);

    let w = pos - tree_center;
    (r, w)
}

pub fn do_model_tree(p: utils::Vec3) -> f64 {
    let (r, w) = cal_model_tree(p);
    let len = (w / r).length();
    let tree = (len * len - len) / (w / r / r).length() + fbm_vec3(p * 600.) * fbm_vec3(p * 600.) * 0.01;
    tree
}

/* pub fn do_model_clouds(p: utils::Vec3) {
    vec3 posInFact = p + iTime / 40.;
    float clouds_height = 4.;
    float clouds = abs(p.y - clouds_height) - 2. * (.4 - fbm(posInFact));
    return clouds;
} */