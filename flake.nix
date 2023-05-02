{
  description = "A very basic flake";
  
  inputs = {
    #nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-22.11";
    # to easily make configs for multiple architectures
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    let
      supportedSystems = [ "x86_64-linux" ];
    in
      flake-utils.lib.eachSystem supportedSystems (system:
        let

            pkgs = import nixpkgs {
              inherit system;
            };
        in
            {
                devShell = pkgs.mkShell {
                    packages = [pkgs.python39 pkgs.python39Packages.virtualenv];
                };
            });
}
