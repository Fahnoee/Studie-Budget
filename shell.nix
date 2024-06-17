{pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
  ];
  shellHook = ''
    export SHELL=$(which zsh)
    exec $SHELL
  '';
}
